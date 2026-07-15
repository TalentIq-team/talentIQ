using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Analytics.Infrastructure;

public class AnalyticsDbContextFactory : IDesignTimeDbContextFactory<AnalyticsDbContext>
{
    public AnalyticsDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? throw new InvalidOperationException(
                "ConnectionStrings__Default environment variable is not configured.");

        var optionsBuilder = new DbContextOptionsBuilder<AnalyticsDbContext>();

        optionsBuilder.UseSqlServer(connectionString);
        return new AnalyticsDbContext(optionsBuilder.Options);
    }
}