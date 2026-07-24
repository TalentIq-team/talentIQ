using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace TalentIQ.IntegrationTests;

/// <summary>
/// FR-AI-02 / FR-AI-05: exercises the real Gemini-backed AI endpoints end-to-end, using a
/// fake <c>IGeminiClient</c> to force both the success path and a forced failure, confirming
/// <c>ResumeAnalysisService</c> falls back to the deterministic scorer and logs the outcome.
/// </summary>
public class AiFallbackTests : IClassFixture<TalentIQApiFactory>
{
    private readonly TalentIQApiFactory _factory;
    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };

    public AiFallbackTests(TalentIQApiFactory factory) => _factory = factory;

    private static async Task<JsonElement> Body(HttpResponseMessage r)
    {
        using var doc = await JsonDocument.ParseAsync(await r.Content.ReadAsStreamAsync());
        return doc.RootElement.Clone();
    }

    [Fact]
    public async Task AnalyzeResume_GeminiSucceeds_ReturnsGeminiScoredResult_NotFallback()
    {
        _factory.GeminiClient.ShouldThrow = false;
        _factory.GeminiClient.ResponseJson = """
            {
              "overallMatchScore": 88,
              "matchedSkills": ["C#", "SQL"],
              "missingSkills": ["Azure"],
              "summary": "Strong backend match with a minor cloud skills gap."
            }
            """;

        var client = _factory.CreateAuthenticatedClient();
        var applicationId = Guid.NewGuid();

        var response = await client.PostAsJsonAsync("/api/ai/analyze-resume", new
        {
            applicationId,
            resumeText = "5 years experience with C# and SQL Server.",
            requiredSkills = new[] { "C#", "SQL", "Azure" }
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await Body(response);
        result.GetProperty("overallMatchScore").GetDecimal().Should().Be(88m);
        result.GetProperty("isFallbackExecution").GetBoolean().Should().BeFalse();

        // Confirm the persisted analysis and execution log both record Gemini as the provider.
        var stored = await Body(await client.GetAsync($"/api/ai/analysis/{applicationId}"));
        stored.GetProperty("isFallbackExecution").GetBoolean().Should().BeFalse();
        stored.GetProperty("overallMatchScore").GetDecimal().Should().Be(88m);
    }

    [Fact]
    public async Task AnalyzeResume_GeminiThrows_FallsBackToDeterministicScoring()
    {
        _factory.GeminiClient.ShouldThrow = true;

        var client = _factory.CreateAuthenticatedClient();
        var applicationId = Guid.NewGuid();

        var response = await client.PostAsJsonAsync("/api/ai/analyze-resume", new
        {
            applicationId,
            resumeText = "Experienced with C# and SQL Server, but no cloud platform exposure.",
            requiredSkills = new[] { "C#", "SQL", "Azure" }
        });

        // The API must still return 200 — the fallback absorbs the Gemini failure rather than
        // surfacing a 5xx to the caller.
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await Body(response);
        result.GetProperty("isFallbackExecution").GetBoolean().Should().BeTrue();
        // Deterministic keyword match: 2 of 3 required skills appear in the résumé text.
        result.GetProperty("overallMatchScore").GetDecimal().Should().Be(66.7m);
        result.GetProperty("matchedSkills").EnumerateArray().Select(e => e.GetString())
            .Should().BeEquivalentTo("C#", "SQL");
        result.GetProperty("missingSkills").EnumerateArray().Select(e => e.GetString())
            .Should().BeEquivalentTo("Azure");

        var stored = await Body(await client.GetAsync($"/api/ai/analysis/{applicationId}"));
        stored.GetProperty("isFallbackExecution").GetBoolean().Should().BeTrue();
    }

    [Fact]
    public async Task CompareJob_GeminiThrows_FallsBackToDeterministicComparison()
    {
        _factory.GeminiClient.ShouldThrow = true;

        var client = _factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/ai/compare-job", new
        {
            jobTitle = "Backend Engineer",
            jobDescription = "Build APIs.",
            jobRequiredSkills = new[] { "C#", "SQL" },
            minExperienceYears = 3,
            candidateSummary = "Backend developer",
            candidateSkills = new[] { "C#" },
            candidateYearsOfExperience = 5,
            candidateResumeText = "Built APIs in C# for 5 years."
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await Body(response);
        result.GetProperty("isFallbackExecution").GetBoolean().Should().BeTrue();
        result.GetProperty("matchedSkills").EnumerateArray().Select(e => e.GetString())
            .Should().Contain("C#");
        result.GetProperty("missingSkills").EnumerateArray().Select(e => e.GetString())
            .Should().Contain("SQL");
    }
}
