using AI.Application.Interfaces;
using AI.Application.Services;
using AI.Infrastructure.Clients;
using AI.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AI.Infrastructure;

/// <summary>
/// Registers all AI module services, repositories, and the Gemini HTTP client.
/// Call this from Program.cs: builder.Services.AddAiModule(builder.Configuration);
/// </summary>
public static class AiModuleRegistration
{
    public static IServiceCollection AddAiModule(this IServiceCollection services, IConfiguration config)
    {
        // Database context
        services.AddDbContext<AiDbContext>(options =>
            options.UseSqlServer(
                config.GetConnectionString("Default"),
                sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "ai")));

        // Repositories
        services.AddScoped<IAiExecutionLogRepository, AiExecutionLogRepository>();
        services.AddScoped<IResumeAnalysisRepository, ResumeAnalysisRepository>();
        services.AddScoped<IInterviewQuestionSetRepository, InterviewQuestionSetRepository>();

        // Gemini HTTP client (via HttpClientFactory)
        services.AddHttpClient<IGeminiClient, GeminiClient>();

        // Application services
        services.AddScoped<FallbackScoringService>();
        services.AddScoped<ResumeAnalysisService>();
        services.AddScoped<InterviewQuestionService>();

        return services;
    }
}
