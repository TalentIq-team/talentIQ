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
        policy.SetIsOriginAllowed(origin =>
            Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
            (uri.Host == "localhost" || uri.Host == "127.0.0.1"))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
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

builder.Services.AddDbContext<AnalyticsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<Notification.Infrastructure.NotificationDbContext>(options =>
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
app.UseStaticFiles();
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

// Candidate Job Search: Compare Job Posting with Candidate CV/Profile using Gemini API
app.MapPost("/api/ai/compare-job", async (
    CompareJobRequest request,
    ResumeAnalysisService service,
    CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.JobTitle))
        return Results.BadRequest(new { error = "JobTitle is required" });

    var result = await service.CompareJobWithCandidateAsync(request, ct);
    return Results.Ok(result);
})
.WithName("CompareJobWithCandidate")
.WithTags("AI")
.Produces<JobComparisonResult>()
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

            var identityDb = services.GetRequiredService<IdentityDbContext>();
            var candidateDb = services.GetRequiredService<CandidateDbContext>();
            var recruitmentDb = services.GetRequiredService<RecruitmentDbContext>();
            var interviewDb = services.GetRequiredService<InterviewDbContext>();
            var analyticsDb = services.GetRequiredService<AnalyticsDbContext>();
            var aiDb = services.GetRequiredService<AiDbContext>();
            var notificationDb = services.GetRequiredService<Notification.Infrastructure.NotificationDbContext>();

            // 1. Identity, Candidate, Recruitment migrations
            try { await identityDb.Database.MigrateAsync(); } catch (Exception ex) { logger.LogWarning(ex, "Identity migration warning"); }
            try { await candidateDb.Database.MigrateAsync(); } catch (Exception ex) { logger.LogWarning(ex, "Candidate migration warning"); }
            try { await recruitmentDb.Database.MigrateAsync(); } catch (Exception ex) { logger.LogWarning(ex, "Recruitment migration warning"); }

            // 2. Ensure interview schema & tables exist BEFORE interviewDb migration
            try
            {
                await interviewDb.Database.ExecuteSqlRawAsync(@"
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'interview')
BEGIN
    EXEC('CREATE SCHEMA [interview]');
END;

IF EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('interview') AND name = 'Interviews')
   AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[interview].[Interviews]') AND name = 'ApplicationId')
BEGIN
    DROP TABLE [interview].[Interviews];
END;

IF EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('interview') AND name = 'CandidateEvaluations')
   AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[interview].[CandidateEvaluations]') AND name = 'TechnicalScore')
BEGIN
    DROP TABLE [interview].[CandidateEvaluations];
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('interview') AND name = 'Interviews')
BEGIN
    CREATE TABLE [interview].[Interviews] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY,
        [ApplicationId] uniqueidentifier NOT NULL,
        [ScheduledStartTime] datetime2 NOT NULL,
        [InterviewerUserId] uniqueidentifier NOT NULL,
        [MeetingLink] nvarchar(max) NOT NULL DEFAULT '',
        [Status] int NOT NULL
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('interview') AND name = 'CandidateEvaluations')
BEGIN
    CREATE TABLE [interview].[CandidateEvaluations] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY,
        [InterviewId] uniqueidentifier NOT NULL,
        [TechnicalScore] decimal(18,2) NOT NULL,
        [BehavioralScore] decimal(18,2) NOT NULL,
        [Recommendation] nvarchar(max) NOT NULL DEFAULT ''
    );
END;
");
                await interviewDb.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Interview migration/table setup warning");
            }

            // 3. Ensure Analytics tables exist
            try
            {
                await analyticsDb.Database.MigrateAsync();
                await analyticsDb.Database.ExecuteSqlRawAsync(@"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TalentPoolEntries')
BEGIN
    CREATE TABLE [TalentPoolEntries] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY,
        [CandidateProfileId] uniqueidentifier NOT NULL,
        [AddedByRecruiterId] uniqueidentifier NOT NULL,
        [ConsentStatus] int NOT NULL,
        [SkillTags] nvarchar(max) NOT NULL,
        [ProfileSnapshotJson] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ConsentRespondedAt] datetime2 NULL,
        [ConsentExpiryDate] datetime2 NULL,
        [IsActive] bit NOT NULL
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TalentPoolProgressReports')
BEGIN
    CREATE TABLE [TalentPoolProgressReports] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY,
        [TalentPoolEntryId] uniqueidentifier NOT NULL,
        [GeneratedAt] datetime2 NOT NULL,
        [SkillsGainedJson] nvarchar(max) NOT NULL,
        [ResumeFreshnessStatus] nvarchar(max) NOT NULL,
        [CurrentMatchScore] decimal(18,2) NOT NULL,
        [Recommendation] nvarchar(max) NOT NULL
    );
END;
");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Analytics migration/table setup warning");
            }

            // 4. Ensure Notification schema & tables exist
            try
            {
                await notificationDb.Database.ExecuteSqlRawAsync(@"
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'notification')
BEGIN
    EXEC('CREATE SCHEMA [notification]');
END;

IF EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('notification') AND name = 'Notifications')
   AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[notification].[Notifications]') AND name = 'RecipientId')
BEGIN
    DROP TABLE [notification].[Notifications];
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('notification') AND name = 'Notifications')
BEGIN
    CREATE TABLE [notification].[Notifications] (
        [Id] uniqueidentifier NOT NULL PRIMARY KEY,
        [RecipientId] uniqueidentifier NOT NULL,
        [Channel] int NOT NULL,
        [Subject] nvarchar(max) NOT NULL,
        [Body] nvarchar(max) NOT NULL,
        [Status] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL
    );
END;
");
                await notificationDb.Database.EnsureCreatedAsync();
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Notification table setup warning");
            }

            // 5. AI DB migration
            try { await aiDb.Database.MigrateAsync(); } catch (Exception ex) { logger.LogWarning(ex, "AI DB migration warning"); }

            // 6. Seed default users in IdentityDbContext
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
                    existingUser.Role = devUser.Role;
                    existingUser.PasswordHash = passwordHasher.HashPassword("Password123!");
                    existingUser.IsActive = true;
                    identityDb.Users.Update(existingUser);
                    logger.LogInformation("Updated dev user: {Email} ({Role})", devUser.Email, devUser.Role);
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

            // 7. Run comprehensive seeding for all modules
            await TalentIQ.Api.Services.DbSeeder.SeedDatabaseAsync(services, logger);

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
