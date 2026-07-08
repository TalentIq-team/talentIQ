using AI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AI.Infrastructure
{
    public class AiDbContext : DbContext
    {
        public AiDbContext(DbContextOptions<AiDbContext> options) : base(options) { }

        public DbSet<ResumeAnalysis> ResumeAnalyses => Set<ResumeAnalysis>();
        public DbSet<AiExecutionLog> AiExecutionLogs => Set<AiExecutionLog>();
        public DbSet<InterviewQuestionSet> InterviewQuestionSets => Set<InterviewQuestionSet>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("ai");
            builder.Entity<ResumeAnalysis>().ToTable("ResumeAnalyses");
            builder.Entity<AiExecutionLog>().ToTable("AiExecutionLogs");
            builder.Entity<InterviewQuestionSet>().ToTable("InterviewQuestionSets");
            base.OnModelCreating(builder);
        }
    }
}

