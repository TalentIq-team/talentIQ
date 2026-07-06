using Interview.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Interview.Infrastructure
{
    public class InterviewDbContext : DbContext
    {
        public InterviewDbContext(DbContextOptions<InterviewDbContext> options) : base(options) { }

        public DbSet<Interview.Domain.Entities.Interview> Interviews => Set<Interview.Domain.Entities.Interview>();
        public DbSet<CandidateEvaluation> CandidateEvaluations => Set<CandidateEvaluation>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("interview");
            builder.Entity<Interview.Domain.Entities.Interview>().ToTable("Interviews");
            builder.Entity<CandidateEvaluation>().ToTable("CandidateEvaluations");
            base.OnModelCreating(builder);
        }
    }
}
