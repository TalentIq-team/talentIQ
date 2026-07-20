using System.Text;
using System.Text.Json;
using AI.Application.DTOs;
using AI.Application.Interfaces;
using AI.Application.Services;
using AI.Infrastructure;
using Analytics.Infrastructure;
using Candidate.Infrastructure;
using Candidate.Infrastructure.Persistence;
using Recruitment.Infrastructure.Persistence;
using Identity.Application.Commands;
using Identity.Infrastructure;
using Interview.Application.Commands.RescheduleInterview;
using Interview.Application.Commands.ScheduleInterview;
using Interview.Application.Commands.SubmitEvaluation;
using Interview.Application.Services;
using Interview.Infrastructure;
using Interview.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Notification.Application.Interfaces;
using Notification.Infrastructure.Services;
using Notification.Infrastructure.Settings;
using Recruitment.Infrastructure;
using TalentIQ.Api.Middleware;

// Load secrets from the git-ignored .env before the configuration system reads
// environment variables, so nothing sensitive needs to live in appsettings.json.
LoadEnvFile();

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
// Registers the DbContext, repository, calendar service and the module's MediatR handlers.
builder.Services.AddInterviewModule(builder.Configuration);

// Composition-root adapter: lets the Interview shortlist view read Shortlisted applications
// from the Recruitment module without either module referencing the other.
builder.Services.AddScoped<Interview.Application.Interfaces.IShortlistedCandidateReader,
    TalentIQ.Api.Services.ShortlistedCandidateReader>();

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddSingleton(sp =>
{
    var settings = new EmailSettings();
    builder.Configuration.GetSection("EmailSettings").Bind(settings);
    return settings;
});
builder.Services.AddScoped<IEmailService, EmailService>();

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

builder.Services.AddDbContext<AnalyticsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Automatic Migration & Seeding for local Development
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Applying migrations and seeding database...");

            // List of DbContexts to migrate
            var identityDb = services.GetRequiredService<IdentityDbContext>();
            await identityDb.Database.MigrateAsync();

            var candidateDb = services.GetRequiredService<CandidateDbContext>();
            await candidateDb.Database.MigrateAsync();

            var recruitmentDb = services.GetRequiredService<RecruitmentDbContext>();
            await recruitmentDb.Database.MigrateAsync();

            var interviewDb = services.GetRequiredService<InterviewDbContext>();
            await interviewDb.Database.MigrateAsync();

            var analyticsDb = services.GetRequiredService<AnalyticsDbContext>();
            await analyticsDb.Database.MigrateAsync();

            var aiDb = services.GetRequiredService<AiDbContext>();
            await aiDb.Database.MigrateAsync();

            // Seed default users in IdentityDbContext
            var passwordHasher = services.GetRequiredService<Identity.Application.Interfaces.IAppPasswordHasher>();
            var devUsers = new[]
            {
                new { Email = "candidate@talentiq.dev", Role = Identity.Domain.Entities.UserRole.Candidate },
                new { Email = "recruiter@talentiq.dev", Role = Identity.Domain.Entities.UserRole.Recruiter },
                new { Email = "manager@talentiq.dev", Role = Identity.Domain.Entities.UserRole.HiringManager },
                new { Email = "admin@talentiq.dev", Role = Identity.Domain.Entities.UserRole.Admin }
            };

            foreach (var devUser in devUsers)
            {
                var existingUser = await identityDb.Users.FirstOrDefaultAsync(u => u.Email == devUser.Email);
                if (existingUser is not null)
                {
                    bool modified = false;
                    if (existingUser.Role != devUser.Role)
                    {
                        existingUser.Role = devUser.Role;
                        modified = true;
                    }

                    if (!passwordHasher.VerifyPassword(existingUser.PasswordHash, "Password123!"))
                    {
                        existingUser.PasswordHash = passwordHasher.HashPassword("Password123!");
                        modified = true;
                    }

                    if (modified)
                    {
                        identityDb.Users.Update(existingUser);
                        logger.LogInformation("Updated existing dev user: {Email} to role {Role}", devUser.Email, devUser.Role);
                    }
                }
                else
                {
                    var newUser = new Identity.Domain.Entities.User
                    {
                        Id = Guid.NewGuid(),
                        Email = devUser.Email,
                        PasswordHash = passwordHasher.HashPassword("Password123!"),
                        Role = devUser.Role,
                        OrganizationId = Guid.Empty,
                        DepartmentId = null,
                        IsActive = true
                    };
                    await identityDb.Users.AddAsync(newUser);
                    logger.LogInformation("Seeded dev user: {Email} ({Role})", devUser.Email, devUser.Role);
                }
            }
            await identityDb.SaveChangesAsync();
            logger.LogInformation("Database migration and seeding completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        }
    }
}

app.Run();

// Reads KEY=VALUE lines from the nearest .env (searched upward from the app's
// base directory) and promotes them to process environment variables so
// IConfiguration picks them up. Existing environment variables are never
// overwritten, so real shell/CI values still take precedence over .env.
static void LoadEnvFile()
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);
    while (dir is not null && !File.Exists(Path.Combine(dir.FullName, ".env")))
        dir = dir.Parent;

    if (dir is null)
        return;

    foreach (var raw in File.ReadAllLines(Path.Combine(dir.FullName, ".env")))
    {
        var line = raw.Trim();
        if (line.Length == 0 || line.StartsWith('#'))
            continue;

        var separator = line.IndexOf('=');
        if (separator <= 0)
            continue;

        var key = line[..separator].Trim();
        var value = line[(separator + 1)..].Trim().Trim('"');

        if (Environment.GetEnvironmentVariable(key) is null)
            Environment.SetEnvironmentVariable(key, value);
    }
}

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
