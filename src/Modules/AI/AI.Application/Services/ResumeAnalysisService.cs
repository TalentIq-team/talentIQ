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

    /// <summary>
    /// Compares a Job Posting directly with a Candidate's CV / Profile using Gemini API.
    /// Hardcodes structured AI evaluation prompt and falls back seamlessly if API fails.
    /// </summary>
    public async Task<JobComparisonResult> CompareJobWithCandidateAsync(
        CompareJobRequest request,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        JobComparisonResult result;
        bool isSuccess = false;
        bool isFallback = false;
        string? errorMessage = null;

        var jobSkills = request.JobRequiredSkills ?? [];
        var candSkills = request.CandidateSkills ?? [];

        try
        {
            var prompt = BuildJobComparisonPrompt(request, jobSkills, candSkills);
            var response = await _geminiClient.GenerateContentAsync(prompt, ct);
            result = ParseJobComparisonResponse(response, jobSkills, candSkills);
            isSuccess = true;

            _logger.LogInformation("Gemini job comparison succeeded for position '{JobTitle}', score: {Score}",
                request.JobTitle, result.OverallMatchScore);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini job comparison failed for position '{JobTitle}', falling back to rule-based analysis", request.JobTitle);

            result = FallbackJobComparison(request, jobSkills, candSkills);
            isFallback = true;
            errorMessage = ex.Message;
        }

        sw.Stop();

        // FR-AI-05: Log every AI call
        await _logRepo.AddAsync(new AiExecutionLog
        {
            Id = Guid.NewGuid(),
            Feature = "JobComparison",
            Provider = isFallback ? "Fallback" : "Gemini",
            DurationMs = (int)sw.ElapsedMilliseconds,
            IsSuccess = isSuccess,
            IsFallback = isFallback,
            ErrorMessage = errorMessage,
            ExecutedAt = DateTime.UtcNow
        }, ct);

        return result;
    }

    private static string BuildJobComparisonPrompt(
        CompareJobRequest req,
        List<string> jobSkills,
        List<string> candidateSkills)
    {
        var jobSkillsStr = jobSkills.Count > 0 ? string.Join(", ", jobSkills) : "Not specified explicitly";
        var candSkillsStr = candidateSkills.Count > 0 ? string.Join(", ", candidateSkills) : "Not specified explicitly";

        return $$"""
            You are an expert AI Talent Acquisition Architect and Career Advisor for TalentIQ.
            Perform a thorough, objective match comparison between the following Job Opportunity and Candidate Profile/CV.

            ### JOB OPPORTUNITY DETAILS:
            - **Title:** {{req.JobTitle}}
            - **Description:** {{req.JobDescription}}
            - **Required Skills:** {{jobSkillsStr}}
            - **Minimum Experience Required:** {{req.MinExperienceYears}} years

            ### CANDIDATE PROFILE & CV DETAILS:
            - **Professional Summary:** {{req.CandidateSummary}}
            - **Candidate Skills:** {{candSkillsStr}}
            - **Years of Experience:** {{req.CandidateYearsOfExperience}} years
            - **Resume / CV Content:**
            {{req.CandidateResumeText ?? "No resume uploaded."}}

            ### INSTRUCTIONS:
            Evaluate the candidate's skills, qualifications, and experience against the target position.
            Produce a raw JSON response (no markdown code blocks, no extra text outside the JSON) with EXACTLY this structure:

            {
              "overallMatchScore": <number between 0 and 100>,
              "matchedSkills": ["skill1", "skill2"],
              "missingSkills": ["skill3"],
              "keyStrengths": ["Strength detail 1", "Strength detail 2"],
              "growthAreas": ["Growth area 1"],
              "recommendations": ["Actionable recommendation for candidate 1", "Recommendation 2"],
              "executiveSummary": "A concise 2-4 sentence explanation of the overall match and career recommendations."
            }
            """;
    }

    private static JobComparisonResult ParseJobComparisonResponse(
        string response,
        List<string> jobSkills,
        List<string> candidateSkills)
    {
        var cleaned = response
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        using var doc = JsonDocument.Parse(cleaned);
        var root = doc.RootElement;

        var score = root.GetProperty("overallMatchScore").GetDecimal();

        List<string> ReadStringList(string propertyName) =>
            root.TryGetProperty(propertyName, out var prop) && prop.ValueKind == JsonValueKind.Array
                ? prop.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => !string.IsNullOrWhiteSpace(s)).ToList()
                : [];

        var matched = ReadStringList("matchedSkills");
        var missing = ReadStringList("missingSkills");
        var strengths = ReadStringList("keyStrengths");
        var growth = ReadStringList("growthAreas");
        var recs = ReadStringList("recommendations");
        var summary = root.TryGetProperty("executiveSummary", out var sumProp) ? sumProp.GetString() ?? "" : "";

        return new JobComparisonResult
        {
            OverallMatchScore = Math.Clamp(score, 0, 100),
            MatchedSkills = matched,
            MissingSkills = missing,
            KeyStrengths = strengths,
            GrowthAreas = growth,
            Recommendations = recs,
            ExecutiveSummary = summary,
            IsFallbackExecution = false
        };
    }

    private static JobComparisonResult FallbackJobComparison(
        CompareJobRequest req,
        List<string> jobSkills,
        List<string> candidateSkills)
    {
        var resumeLower = ((req.CandidateResumeText ?? "") + " " + req.CandidateSummary + " " + string.Join(" ", candidateSkills)).ToLowerInvariant();

        var matched = new List<string>();
        var missing = new List<string>();

        foreach (var skill in jobSkills)
        {
            if (string.IsNullOrWhiteSpace(skill)) continue;
            if (resumeLower.Contains(skill.ToLowerInvariant())) matched.Add(skill);
            else missing.Add(skill);
        }

        var total = matched.Count + missing.Count;
        var skillScore = total > 0 ? (decimal)matched.Count / total * 70m : 35m;
        var expScore = req.CandidateYearsOfExperience >= req.MinExperienceYears ? 30m : (req.CandidateYearsOfExperience / Math.Max(1, req.MinExperienceYears)) * 20m;
        var score = Math.Round(Math.Clamp(skillScore + expScore, 0, 100), 1);

        var strengths = new List<string>();
        if (matched.Count > 0) strengths.Add($"Demonstrates matching skill alignment in: {string.Join(", ", matched)}.");
        if (req.CandidateYearsOfExperience >= req.MinExperienceYears) strengths.Add($"Meets or exceeds minimum required experience ({req.CandidateYearsOfExperience} yrs vs {req.MinExperienceYears} yrs required).");

        var growth = new List<string>();
        if (missing.Count > 0) growth.Add($"Missing key target skills: {string.Join(", ", missing)}.");
        if (req.CandidateYearsOfExperience < req.MinExperienceYears) growth.Add($"Below target minimum experience requirement ({req.CandidateYearsOfExperience} yrs vs {req.MinExperienceYears} yrs required).");

        var recs = new List<string>
        {
            "Tailor your CV resume summary to highlight relevant project achievements.",
            "Consider completing certification or hands-on projects for missing skills before applying."
        };

        var summary = $"Candidate achieves a {score}% match for '{req.JobTitle}'. Found {matched.Count} of {total} required skills in candidate profile and CV.";

        return new JobComparisonResult
        {
            OverallMatchScore = score,
            MatchedSkills = matched,
            MissingSkills = missing,
            KeyStrengths = strengths,
            GrowthAreas = growth,
            Recommendations = recs,
            ExecutiveSummary = summary,
            IsFallbackExecution = true
        };
    }
}

