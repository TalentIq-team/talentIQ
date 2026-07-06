using Analytics.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Analytics.Infrastructure
{
    public class AnalyticsDbContext : DbContext
    {
        public AnalyticsDbContext(DbContextOptions<AnalyticsDbContext> options) : base(options) { }

        public DbSet<TalentPoolEntry> TalentPoolEntries => Set<TalentPoolEntry>();
        public DbSet<TalentPoolProgressReport> TalentPoolProgressReports => Set<TalentPoolProgressReport>();
        public DbSet<DailyKpiSnapshot> DailyKpiSnapshots => Set<DailyKpiSnapshot>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("analytics");
            builder.Entity<TalentPoolEntry>().ToTable("TalentPoolEntries");
            builder.Entity<TalentPoolProgressReport>().ToTable("TalentPoolProgressReports");
            builder.Entity<DailyKpiSnapshot>().ToTable("DailyKpiSnapshots");
            base.OnModelCreating(builder);
        }
    }
}
