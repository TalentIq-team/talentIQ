using System.Text;
using System.Text.Json;
using AI.Application.DTOs;
using AI.Application.Interfaces;
using AI.Application.Services;
using AI.Infrastructure;
using Candidate.Infrastructure;
using Identity.Application.Commands;
using Identity.Infrastructure;
using Interview.Application.Commands.RescheduleInterview;
using Interview.Application.Commands.ScheduleInterview;
using Interview.Application.Commands.SubmitEvaluation;
using Interview.Application.Services;
using Interview.Infrastructure;
using Interview.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Notification.Application.Interfaces;
using Notification.Infrastructure.Services;
using Notification.Infrastructure.Settings;
using Recruitment.Infrastructure;
using TalentIQ.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Core services
// ---------------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TalentIQ API",
        Version = "v1",
        Description = "AI-Powered Recruitment and Talent Management Platform"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter the JWT token issued by the Identity module."
    });
    options.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", doc, null)] = new List<string>()
    });
});

// ---------------------------------------------------------------------------
// JWT Bearer authentication (signing key issued/shared by the Identity module)
// ---------------------------------------------------------------------------
var signingKey = builder.Configuration["Jwt:SigningKey"]
    ?? builder.Configuration["JWT_SIGNING_KEY"]
    ?? "insecure-development-signing-key-change-me-minimum-32-chars";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// ---------------------------------------------------------------------------
// CORS for the React (Vite) frontend
// ---------------------------------------------------------------------------
const string FrontendCorsPolicy = "frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:4173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// ---------------------------------------------------------------------------
// Member 3 modules — Candidate + Recruitment.
// Other members register their own modules here (AddIdentityModule, etc.).
// ---------------------------------------------------------------------------
builder.Services.AddCandidateModule(builder.Configuration);
builder.Services.AddRecruitmentModule(builder.Configuration);

// API-level cross-module adapters (composition root):
// - CandidateSkillReader lets the Recruitment analyzer read Candidate skills (FR-RC-05).
// - DevTokenService issues development JWTs for testing (see DevAuthController).
builder.Services.AddScoped<Recruitment.Application.Common.Interfaces.ICandidateSkillReader,
    TalentIQ.Api.Services.CandidateSkillReader>();
builder.Services.AddSingleton<TalentIQ.Api.Services.DevTokenService>();

builder.Services.AddIdentityModule(builder.Configuration);

builder.Services.AddMediatR(configuration =>
{
    configuration.RegisterServicesFromAssembly(
        typeof(RegisterUserCommand).Assembly);
});

// ---------------------------------------------------------------------------
// Member 4 module — Interview scheduling + evaluations (with Notification/email).
// ---------------------------------------------------------------------------
builder.Services.AddInterviewInfrastructure(builder.Configuration);
builder.Services.AddScoped<ScheduleInterviewCommandHandler>();
builder.Services.AddScoped<RescheduleInterviewCommandHandler>();
builder.Services.AddScoped<SubmitEvaluationCommandHandler>();

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddSingleton(sp =>
{
    var settings = new EmailSettings();
    builder.Configuration.GetSection("EmailSettings").Bind(settings);
    return settings;
});
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT signing key is not configured.");

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"] ?? "TalentIQ.Api";

var jwtAudience =
    builder.Configuration["Jwt:Audience"] ?? "TalentIQ.Client";

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)),

                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

// Register the AI module (DbContext, repositories, Gemini client, services)
builder.Services.AddAiModule(builder.Configuration);

var app = builder.Build();

// ---------------------------------------------------------------------------
// HTTP pipeline
// ---------------------------------------------------------------------------
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(ui => ui.SwaggerEndpoint("/swagger/v1/swagger.json", "TalentIQ API v1"));
}

app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ============================================================
// Member 5 module — AI Module Endpoints (Minimal API)
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

// Exposed so integration tests can use WebApplicationFactory<Program>.
public partial class Program { }

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
