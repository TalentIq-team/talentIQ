using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Recruitment.Infrastructure.Persistence;

/// <summary>Design-time factory for <c>dotnet ef migrations</c> (Recruitment module).</summary>
public class RecruitmentDbContextFactory : IDesignTimeDbContextFactory<RecruitmentDbContext>
{
    public RecruitmentDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? throw new InvalidOperationException(
                "ConnectionStrings__Default environment variable is not configured.");

        var options = new DbContextOptionsBuilder<RecruitmentDbContext>()
            .UseSqlServer(connectionString, sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", RecruitmentDbContext.Schema))
            .Options;

        return new RecruitmentDbContext(options);
    }
}
