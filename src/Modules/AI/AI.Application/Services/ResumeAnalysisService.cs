using System.Diagnostics;
using System.Text.Json;
using AI.Application.DTOs;
using AI.Application.Interfaces;
using AI.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace AI.Application.Services;

/// <summary>
/// Core orchestration for résumé analysis (FR-AI-01, FR-AI-02, FR-AI-03, FR-AI-05).
/// Calls Gemini first; on failure, runs the deterministic fallback.
/// Every invocation is logged to AiExecutionLog.
/// </summary>
public class ResumeAnalysisService
{
    private readonly IGeminiClient _geminiClient;
    private readonly FallbackScoringService _fallback;
    private readonly IResumeAnalysisRepository _analysisRepo;
    private readonly IAiExecutionLogRepository _logRepo;
    private readonly ILogger<ResumeAnalysisService> _logger;

    public ResumeAnalysisService(
        IGeminiClient geminiClient,
        FallbackScoringService fallback,
        IResumeAnalysisRepository analysisRepo,
        IAiExecutionLogRepository logRepo,
        ILogger<ResumeAnalysisService> logger)
    {
        _geminiClient = geminiClient;
        _fallback = fallback;
        _analysisRepo = analysisRepo;
        _logRepo = logRepo;
        _logger = logger;
    }

    public async Task<ResumeAnalysisResult> AnalyzeAsync(
        Guid applicationId,
        string resumeText,
        List<string> requiredSkills,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        ResumeAnalysisResult result;
        bool isSuccess = false;
        bool isFallback = false;
        string? errorMessage = null;

        try
        {
            var prompt = BuildPrompt(resumeText, requiredSkills);
            var response = await _geminiClient.GenerateContentAsync(prompt, ct);
            result = ParseGeminiResponse(response, requiredSkills);
            isSuccess = true;

            _logger.LogInformation("Gemini résumé analysis succeeded for application {ApplicationId}, score: {Score}",
                applicationId, result.OverallMatchScore);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini résumé analysis failed for application {ApplicationId}, falling back to rule-based scoring", applicationId);

            result = _fallback.ScoreResume(resumeText, requiredSkills);
            isFallback = true;
            errorMessage = ex.Message;
        }

        sw.Stop();

        // FR-AI-05: Log every AI call
        await _logRepo.AddAsync(new AiExecutionLog
        {
            Id = Guid.NewGuid(),
            Feature = "ResumeAnalysis",
            Provider = isFallback ? "Fallback" : "Gemini",
            DurationMs = (int)sw.ElapsedMilliseconds,
            IsSuccess = isSuccess,
            IsFallback = isFallback,
            ErrorMessage = errorMessage,
            ExecutedAt = DateTime.UtcNow
        }, ct);

        // Persist the analysis result
        await _analysisRepo.AddAsync(new ResumeAnalysis
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            OverallMatchScore = result.OverallMatchScore,
            MatchedSkillsJson = JsonSerializer.Serialize(result.MatchedSkills),
            MissingSkillsJson = JsonSerializer.Serialize(result.MissingSkills),
            Summary = result.Summary,
            IsFallbackExecution = isFallback,
            CreatedAt = DateTime.UtcNow
        }, ct);

        return result;
    }

    private static string BuildPrompt(string resumeText, List<string> requiredSkills)
    {
        var skillsList = string.Join(", ", requiredSkills);

        return $$"""
            You are an expert recruitment AI assistant. Analyze the following résumé against the required skills for a job position.

            **Required Skills:** {{skillsList}}

            **Résumé Text:**
            {{resumeText}}

            **Instructions:**
            1. Compare the résumé against each required skill.
            2. Produce a JSON response with exactly this structure (no markdown, no code fences, just raw JSON):

            {
              "overallMatchScore": <number 0-100>,
              "matchedSkills": ["skill1", "skill2"],
              "missingSkills": ["skill3"],
              "summary": "A 2-3 sentence plain-language explanation of strengths and weaknesses. Explain WHY the score is what it is."
            }

            Be precise — only list a skill as matched if the résumé clearly demonstrates experience with it.
            The summary must explain the reasoning, not just restate the numbers.
            """;
    }

    private static ResumeAnalysisResult ParseGeminiResponse(string response, List<string> requiredSkills)
    {
        // Strip any potential markdown code fences
        var cleaned = response
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        try
        {
            using var doc = JsonDocument.Parse(cleaned);
            var root = doc.RootElement;

            var score = root.GetProperty("overallMatchScore").GetDecimal();
            var matched = root.GetProperty("matchedSkills")
                .EnumerateArray()
                .Select(e => e.GetString() ?? "")
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToList();
            var missing = root.GetProperty("missingSkills")
                .EnumerateArray()
                .Select(e => e.GetString() ?? "")
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .ToList();
            var summary = root.GetProperty("summary").GetString() ?? "";

            return new ResumeAnalysisResult
            {
                OverallMatchScore = Math.Clamp(score, 0, 100),
                MatchedSkills = matched,
                MissingSkills = missing,
                Summary = summary,
                IsFallbackExecution = false
            };
        }
        catch (JsonException)
        {
            // If Gemini returns unparseable JSON, throw so the caller triggers fallback
            throw new InvalidOperationException(
                $"Gemini returned a response that could not be parsed as valid JSON: {cleaned[..Math.Min(200, cleaned.Length)]}");
        }
    }
}
