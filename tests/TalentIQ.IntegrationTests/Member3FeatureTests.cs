using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Candidate.Domain.Entities;
using Candidate.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace TalentIQ.IntegrationTests;

/// <summary>
/// End-to-end coverage for the newly completed Member 3 features:
/// FR-CD-01 proficiency, FR-CD-06 recommendations, FR-RC-04 messaging, FR-RC-05 auto analysis.
/// </summary>
public class Member3FeatureTests : IClassFixture<TalentIQApiFactory>
{
    private readonly TalentIQApiFactory _factory;
    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };

    public Member3FeatureTests(TalentIQApiFactory factory) => _factory = factory;

    private Guid SeedSkill(string name)
    {
        var id = Guid.NewGuid();
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CandidateDbContext>();
        db.Skills.Add(new Skill(id, name, "Programming"));
        db.SaveChanges();
        return id;
    }

    private static async Task<JsonElement> Body(HttpResponseMessage r)
    {
        using var doc = await JsonDocument.ParseAsync(await r.Content.ReadAsStreamAsync());
        return doc.RootElement.Clone();
    }

    [Fact]
    public async Task Profile_Recommendation_Message_And_Analysis_Flow()
    {
        var client = _factory.CreateAuthenticatedClient();
        var skillId = SeedSkill($"C#-{Guid.NewGuid()}");

        // FR-CD-01: create profile with a skill + proficiency level.
        var createProfile = await client.PostAsJsonAsync("/api/v1/candidates/profile", new
        {
            userId = Guid.NewGuid(),
            professionalSummary = "Backend Developer",
            yearsOfExperience = 5,
            skills = new[] { new { skillId, proficiencyLevel = "Advanced" } }
        });
        createProfile.StatusCode.Should().Be(HttpStatusCode.Created);
        var profile = await Body(createProfile);
        var profileId = profile.GetProperty("id").GetGuid();
        profile.GetProperty("skills")[0].GetProperty("proficiencyLevel").GetString().Should().Be("Advanced");

        // FR-RC-01: create + publish a job requiring the same skill.
        var createJob = await client.PostAsJsonAsync("/api/v1/jobs", new
        {
            organizationId = Guid.NewGuid(),
            recruiterId = Guid.NewGuid(),
            title = "Backend Engineer",
            description = "d",
            location = "Remote",
            employmentType = 1,
            minExperienceYears = 2,
            skillIds = new[] { skillId }
        });
        var jobId = (await Body(createJob)).GetProperty("id").GetGuid();
        await client.PostAsync($"/api/v1/jobs/{jobId}/publish", null);

        // FR-CD-06: recommendations should surface that job at 100% overlap.
        var recs = await Body(await client.GetAsync($"/api/v1/candidates/{profileId}/recommended-jobs"));
        recs.GetArrayLength().Should().BeGreaterThan(0);
        recs[0].GetProperty("jobId").GetGuid().Should().Be(jobId);
        recs[0].GetProperty("matchPercentage").GetInt32().Should().Be(100);

        // FR-CD-04 + FR-RC-05: submit → analysis auto-runs and is retrievable.
        var submit = await client.PostAsJsonAsync("/api/v1/applications", new { jobPostingId = jobId, candidateProfileId = profileId });
        var applicationId = (await Body(submit)).GetProperty("id").GetGuid();

        var analysisResponse = await client.GetAsync($"/api/v1/applications/{applicationId}/analysis");
        analysisResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var analysis = await Body(analysisResponse);
        analysis.GetProperty("matchScore").GetDecimal().Should().Be(100m);

        // FR-RC-04: send a message and read the thread back.
        var send = await client.PostAsJsonAsync("/api/v1/messages", new { applicationId, senderUserId = Guid.NewGuid(), body = "Thanks for applying!" });
        send.StatusCode.Should().Be(HttpStatusCode.Created);

        var thread = await Body(await client.GetAsync($"/api/v1/messages/application/{applicationId}"));
        thread.GetArrayLength().Should().Be(1);
        thread[0].GetProperty("body").GetString().Should().Be("Thanks for applying!");
    }

    [Fact]
    public async Task CandidateSearch_FiltersByExperience()
    {
        var client = _factory.CreateAuthenticatedClient();

        await client.PostAsJsonAsync("/api/v1/candidates/profile", new
        {
            userId = Guid.NewGuid(), professionalSummary = "Junior", yearsOfExperience = 1, skills = Array.Empty<object>()
        });
        await client.PostAsJsonAsync("/api/v1/candidates/profile", new
        {
            userId = Guid.NewGuid(), professionalSummary = "Senior", yearsOfExperience = 9, skills = Array.Empty<object>()
        });

        var searchResponse = await client.GetAsync("/api/v1/candidates/search?minExperience=5");
        searchResponse.StatusCode.Should().Be(HttpStatusCode.OK, await searchResponse.Content.ReadAsStringAsync());
        var results = await Body(searchResponse);
        results.GetArrayLength().Should().BeGreaterThan(0);
        foreach (var item in results.EnumerateArray())
        {
            item.GetProperty("yearsOfExperience").GetDecimal().Should().BeGreaterThanOrEqualTo(5);
        }
    }
}
