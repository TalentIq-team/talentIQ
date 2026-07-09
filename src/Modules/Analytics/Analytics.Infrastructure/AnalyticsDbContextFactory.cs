using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Analytics.Infrastructure;

public class AnalyticsDbContextFactory : IDesignTimeDbContextFactory<AnalyticsDbContext>
{
    public AnalyticsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AnalyticsDbContext>();

        optionsBuilder.UseSqlServer(
       "Server=localhost,11433;Database=TalentIQ;User Id=sa;Password=TalentIq2026!Secure;TrustServerCertificate=True");
        return new AnalyticsDbContext(optionsBuilder.Options);
    }
}