using Analytics.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Analytics.Infrastructure;

public class AnalyticsDbContext : DbContext
{
    public AnalyticsDbContext(DbContextOptions<AnalyticsDbContext> options)
        : base(options)
    {
    }

    public DbSet<DailyKpiSnapshot> DailyKpiSnapshots { get; set; }
    public DbSet<TalentPoolEntry> TalentPoolEntries { get; set; }
    public DbSet<TalentPoolProgressReport> TalentPoolProgressReports { get; set; }
}