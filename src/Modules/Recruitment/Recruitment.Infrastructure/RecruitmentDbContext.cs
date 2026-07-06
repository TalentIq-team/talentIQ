using Microsoft.EntityFrameworkCore;
using Recruitment.Domain.Entities;

namespace Recruitment.Infrastructure
{
    public class RecruitmentDbContext : DbContext
    {
        public RecruitmentDbContext(DbContextOptions<RecruitmentDbContext> options) : base(options) { }

        public DbSet<JobPosting> JobPostings => Set<JobPosting>();
        public DbSet<JobPostingSkill> JobPostingSkills => Set<JobPostingSkill>();
        public DbSet<Application> Applications => Set<Application>();
        public DbSet<ApplicationStageHistory> ApplicationStageHistory => Set<ApplicationStageHistory>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("recruitment");
            builder.Entity<JobPosting>().ToTable("JobPostings");
            builder.Entity<JobPostingSkill>().ToTable("JobPostingSkills");
            builder.Entity<Application>().ToTable("Applications");
            builder.Entity<ApplicationStageHistory>().ToTable("ApplicationStageHistory");
            builder.Entity<JobPostingSkill>().HasKey(x => new { x.JobPostingId, x.SkillId });
            base.OnModelCreating(builder);
        }
    }
}
