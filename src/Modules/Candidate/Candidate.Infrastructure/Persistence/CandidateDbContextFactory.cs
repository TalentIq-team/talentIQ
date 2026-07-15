using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Candidate.Infrastructure.Persistence;

/// <summary>
/// Design-time factory so <c>dotnet ef migrations</c> can create a CandidateDbContext
/// without booting the whole API host. The connection string here is only used at design time.
/// </summary>
public class CandidateDbContextFactory : IDesignTimeDbContextFactory<CandidateDbContext>
{
    public CandidateDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? throw new InvalidOperationException(
                "ConnectionStrings__Default environment variable is not configured.");

        var options = new DbContextOptionsBuilder<CandidateDbContext>()
            .UseSqlServer(connectionString, sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", CandidateDbContext.Schema))
            .Options;

        return new CandidateDbContext(options);
    }
}
