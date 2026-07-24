using AI.Application.Interfaces;

namespace TalentIQ.IntegrationTests;

/// <summary>
/// Test double for <see cref="IGeminiClient"/> that lets a test force either a successful
/// Gemini response or a thrown exception, so the fallback branch in <c>ResumeAnalysisService</c>
/// can be exercised deterministically without calling the real Gemini API.
/// </summary>
public class FakeGeminiClient : IGeminiClient
{
    public bool ShouldThrow { get; set; }
    public string ResponseJson { get; set; } = "{}";

    public Task<string> GenerateContentAsync(string prompt, CancellationToken ct = default)
    {
        if (ShouldThrow)
        {
            throw new HttpRequestException("Simulated Gemini outage for test.");
        }

        return Task.FromResult(ResponseJson);
    }
}
