using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Recruitment.Application;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Infrastructure.Analysis;
using Recruitment.Infrastructure.Persistence;

namespace Recruitment.Infrastructure;

/// <summary>
/// Composition root for the Recruitment module: registers the DbContext, the Unit of Work,
/// and the application layer. Called once from the API's Program.cs.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddRecruitmentModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? configuration["ConnectionStrings:Default"];

        services.AddDbContext<RecruitmentDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", RecruitmentDbContext.Schema)));

        services.AddScoped<IRecruitmentDbContext>(sp => sp.GetRequiredService<RecruitmentDbContext>());
        services.AddScoped<IUnitOfWork, RecruitmentUnitOfWork>();

        // FR-RC-05: deterministic skill-overlap analyzer (fallback when no external AI is configured).
        services.AddScoped<IResumeAnalyzer, SkillOverlapResumeAnalyzer>();

        services.AddRecruitmentApplication();

        return services;
    }
}
