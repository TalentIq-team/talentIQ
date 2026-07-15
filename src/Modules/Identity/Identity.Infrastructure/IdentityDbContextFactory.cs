using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Identity.Infrastructure;

public sealed class IdentityDbContextFactory
    : IDesignTimeDbContextFactory<IdentityDbContext>
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable(
                "ConnectionStrings__Default");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings__Default environment variable is not configured.");
        }

        var optionsBuilder =
            new DbContextOptionsBuilder<IdentityDbContext>();

        optionsBuilder.UseSqlServer(connectionString);

        return new IdentityDbContext(optionsBuilder.Options);
    }
}