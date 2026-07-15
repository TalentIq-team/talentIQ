using Candidate.Application;
using Candidate.Application.Common.Interfaces;
using Candidate.Infrastructure.Persistence;
using Candidate.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Candidate.Infrastructure;

/// <summary>
/// Composition root for the Candidate module: registers the DbContext, the application layer,
/// and the Blob resume-storage service. Called once from the API's Program.cs.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddCandidateModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? configuration["ConnectionStrings:Default"];

        services.AddDbContext<CandidateDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", CandidateDbContext.Schema)));

        services.AddScoped<ICandidateDbContext>(sp => sp.GetRequiredService<CandidateDbContext>());

        var blobOptions = new BlobStorageOptions
        {
            ConnectionString = configuration["BlobStorage:ConnectionString"]
                ?? configuration["BLOB_CONNECTION_STRING"]
                ?? "UseDevelopmentStorage=true",
            ResumeContainerName = configuration["BlobStorage:ResumeContainerName"] ?? "resumes"
        };
        services.AddSingleton(blobOptions);
        services.AddScoped<IResumeStorageService, BlobResumeStorageService>();

        services.AddCandidateApplication();

        return services;
    }
}
