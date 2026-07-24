using System.Diagnostics;
using System.Text.Json;
using AI.Application.DTOs;
using AI.Application.Interfaces;
using AI.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace AI.Application.Services;

/// <summary>
/// Core orchestration for interview question generation (FR-AI-04, FR-AI-05).
/// Calls Gemini for 5-8 tailored questions; falls back to static templates if AI is unavailable.
/// Every invocation is logged to AiExecutionLog.
/// </summary>
public class InterviewQuestionService
{
    private readonly IGeminiClient _geminiClient;
    private readonly FallbackScoringService _fallback;
    private readonly IInterviewQuestionSetRepository _questionRepo;
    private readonly IAiExecutionLogRepository _logRepo;
    private readonly ILogger<InterviewQuestionService> _logger;

    public InterviewQuestionService(
        IGeminiClient geminiClient,
        FallbackScoringService fallback,
        IInterviewQuestionSetRepository questionRepo,
        IAiExecutionLogRepository logRepo,
        ILogger<InterviewQuestionService> logger)
    {
        _geminiClient = geminiClient;
        _fallback = fallback;
        _questionRepo = questionRepo;
        _logRepo = logRepo;
        _logger = logger;
    }

    public async Task<InterviewQuestionsResult> GenerateAsync(
        Guid applicationId,
        string jobTitle,
        string jobDescription,
        string resumeText,
        CancellationToken ct = default)
    {
        var sw = Stopwatch.StartNew();
        InterviewQuestionsResult result;
        bool isSuccess = false;
        bool isFallback = false;
        string? errorMessage = null;

        try
        {
            var prompt = BuildPrompt(jobTitle, jobDescription, resumeText);
            var response = await _geminiClient.GenerateContentAsync(prompt, ct);
            result = ParseGeminiResponse(response);
            isSuccess = true;

            _logger.LogInformation(
                "Gemini interview question generation succeeded for application {ApplicationId}, {Count} questions",
                applicationId, result.Questions.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Gemini interview question generation failed for application {ApplicationId}, using static templates",
                applicationId);

            result = _fallback.GenerateFallbackQuestions(jobTitle);
            isFallback = true;
            errorMessage = ex.Message;
        }

        sw.Stop();

        // FR-AI-05: Log every AI call
        await _logRepo.AddAsync(new AiExecutionLog
        {
            Id = Guid.NewGuid(),
            Feature = "InterviewQuestions",
            Provider = isFallback ? "Fallback" : "Gemini",
            DurationMs = (int)sw.ElapsedMilliseconds,
            IsSuccess = isSuccess,
            IsFallback = isFallback,
            ErrorMessage = errorMessage,
            ExecutedAt = DateTime.UtcNow
        }, ct);

        // Persist the question set
        await _questionRepo.AddAsync(new InterviewQuestionSet
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            QuestionsJson = JsonSerializer.Serialize(result.Questions),
            IsFallbackExecution = isFallback,
            CreatedAt = DateTime.UtcNow
        }, ct);

        return result;
    }

    private static string BuildPrompt(string jobTitle, string jobDescription, string resumeText)
    {
        return $$"""
            You are an expert interviewer AI assistant. Generate interview questions tailored to a specific job and candidate.

            **Job Title:** {{jobTitle}}
            **Job Description:** {{jobDescription}}

            **Candidate Résumé:**
            {{resumeText}}

            **Instructions:**
            1. Generate between 5 and 8 interview questions.
            2. Include a mix of question types: Technical, Behavioral, and Scenario.
            3. Tailor each question to the specific job requirements AND the candidate's background.
            4. Produce a JSON response with exactly this structure (no markdown, no code fences, just raw JSON):

            {
              "questions": [
                { "type": "Technical", "question": "Your question here", "expectedAnswerDetails": "What to look for in candidate response" },
                { "type": "Behavioral", "question": "Your question here", "expectedAnswerDetails": "What to look for in candidate response" },
                { "type": "Scenario", "question": "Your question here", "expectedAnswerDetails": "What to look for in candidate response" }
              ]
            }

            Make questions specific and probing — avoid generic questions.
            Reference specific technologies or experiences from the résumé where relevant.
            """;
    }

    private static InterviewQuestionsResult ParseGeminiResponse(string response)
    {
        var cleaned = response
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        try
        {
            using var doc = JsonDocument.Parse(cleaned);
            var root = doc.RootElement;

            var questions = root.GetProperty("questions")
                .EnumerateArray()
                .Select(e => new InterviewQuestion
                {
                    Type = e.TryGetProperty("type", out var t) ? t.GetString() ?? "Technical" : "Technical",
                    Question = e.TryGetProperty("question", out var q) ? q.GetString() ?? "" : (e.TryGetProperty("Question", out var q2) ? q2.GetString() ?? "" : ""),
                    ExpectedAnswerDetails = e.TryGetProperty("expectedAnswerDetails", out var a) ? a.GetString() ?? "" : (e.TryGetProperty("ExpectedAnswerDetails", out var a2) ? a2.GetString() ?? "" : "")
                })
                .Where(q => !string.IsNullOrWhiteSpace(q.Question))
                .ToList();

            if (questions.Count < 3)
            {
                throw new InvalidOperationException(
                    $"Gemini returned only {questions.Count} questions, expected at least 5");
            }

            return new InterviewQuestionsResult
            {
                Questions = questions,
                IsFallbackExecution = false
            };
        }
        catch (JsonException)
        {
            throw new InvalidOperationException(
                $"Gemini returned a response that could not be parsed as valid JSON: {cleaned[..Math.Min(200, cleaned.Length)]}");
        }
    }
}
