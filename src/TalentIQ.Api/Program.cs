using System.Text.Json;
using AI.Application.DTOs;
using AI.Application.Interfaces;
using AI.Application.Services;
using AI.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register the AI module (DbContext, repositories, Gemini client, services)
builder.Services.AddAiModule(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ============================================================
// AI Module Endpoints
// ============================================================

// FR-AI-01 / FR-AI-02 / FR-AI-03: Analyze résumé against required skills
app.MapPost("/api/ai/analyze-resume", async (
    AnalyzeResumeRequest request,
    ResumeAnalysisService service,
    CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.ResumeText))
        return Results.BadRequest(new { error = "ResumeText is required" });

    if (request.RequiredSkills is null || request.RequiredSkills.Count == 0)
        return Results.BadRequest(new { error = "RequiredSkills must contain at least one skill" });

    var result = await service.AnalyzeAsync(
        request.ApplicationId,
        request.ResumeText,
        request.RequiredSkills,
        ct);

    return Results.Ok(result);
})
.WithName("AnalyzeResume")
.WithTags("AI")
.Produces<ResumeAnalysisResult>()
.Produces(400);

// FR-AI-04: Generate tailored interview questions
app.MapPost("/api/ai/generate-interview-questions", async (
    GenerateQuestionsRequest request,
    InterviewQuestionService service,
    CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.JobTitle))
        return Results.BadRequest(new { error = "JobTitle is required" });

    if (string.IsNullOrWhiteSpace(request.ResumeText))
        return Results.BadRequest(new { error = "ResumeText is required" });

    var result = await service.GenerateAsync(
        request.ApplicationId,
        request.JobTitle,
        request.JobDescription ?? "",
        request.ResumeText,
        ct);

    return Results.Ok(result);
})
.WithName("GenerateInterviewQuestions")
.WithTags("AI")
.Produces<InterviewQuestionsResult>()
.Produces(400);

// FR-AI-03: Get stored analysis for a specific application (explainable breakdown for recruiters)
app.MapGet("/api/ai/analysis/{applicationId:guid}", async (
    Guid applicationId,
    IResumeAnalysisRepository repo,
    CancellationToken ct) =>
{
    var analysis = await repo.GetByApplicationIdAsync(applicationId, ct);
    if (analysis is null)
        return Results.NotFound(new { error = "No analysis found for this application" });

    // Return the explainable breakdown
    return Results.Ok(new
    {
        analysis.Id,
        analysis.ApplicationId,
        analysis.OverallMatchScore,
        MatchedSkills = JsonSerializer.Deserialize<List<string>>(analysis.MatchedSkillsJson) ?? [],
        MissingSkills = JsonSerializer.Deserialize<List<string>>(analysis.MissingSkillsJson) ?? [],
        analysis.Summary,
        analysis.IsFallbackExecution,
        analysis.CreatedAt
    });
})
.WithName("GetResumeAnalysis")
.WithTags("AI")
.Produces(200)
.Produces(404);

// FR-AI-04: Get stored interview questions for a specific application
app.MapGet("/api/ai/interview-questions/{applicationId:guid}", async (
    Guid applicationId,
    IInterviewQuestionSetRepository repo,
    CancellationToken ct) =>
{
    var questionSet = await repo.GetByApplicationIdAsync(applicationId, ct);
    if (questionSet is null)
        return Results.NotFound(new { error = "No interview questions found for this application" });

    return Results.Ok(new
    {
        questionSet.Id,
        questionSet.ApplicationId,
        Questions = JsonSerializer.Deserialize<List<InterviewQuestion>>(questionSet.QuestionsJson) ?? [],
        questionSet.IsFallbackExecution,
        questionSet.CreatedAt
    });
})
.WithName("GetInterviewQuestions")
.WithTags("AI")
.Produces(200)
.Produces(404);

// FR-AI-05: Get recent AI execution logs for reliability reporting
app.MapGet("/api/ai/execution-logs", async (
    IAiExecutionLogRepository repo,
    CancellationToken ct) =>
{
    var logs = await repo.GetRecentAsync(50, ct);
    return Results.Ok(logs);
})
.WithName("GetAiExecutionLogs")
.WithTags("AI");

app.Run();

// ============================================================
// Request DTOs for Minimal API endpoints
// ============================================================

public record AnalyzeResumeRequest(
    Guid ApplicationId,
    string ResumeText,
    List<string> RequiredSkills);

public record GenerateQuestionsRequest(
    Guid ApplicationId,
    string JobTitle,
    string? JobDescription,
    string ResumeText);
