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

            builder.Entity<Interview.Domain.Entities.Interview>(entity =>
            {
                entity.ToTable("Interviews");
                entity.HasKey(x => x.Id);
                entity.Property(x => x.MeetingLink).HasMaxLength(1000);
                entity.Property(x => x.CancellationReason).HasMaxLength(1000);
                entity.HasIndex(x => x.ApplicationId);
            });

            builder.Entity<CandidateEvaluation>(entity =>
            {
                entity.ToTable("CandidateEvaluations");
                entity.HasKey(x => x.Id);

                // Explicit precision: without it SQL Server defaults to decimal(18,2) and EF emits
                // a model-validation warning for these properties.
                entity.Property(x => x.TechnicalScore).HasPrecision(5, 2);
                entity.Property(x => x.BehavioralScore).HasPrecision(5, 2);
                entity.Property(x => x.OverallScore).HasPrecision(5, 2);

                entity.Property(x => x.Comments).HasMaxLength(4000);
                entity.Property(x => x.Recommendation).HasMaxLength(200);

                // One evaluation per interview.
                entity.HasIndex(x => x.InterviewId).IsUnique();
                entity.HasOne<Interview.Domain.Entities.Interview>()
                    .WithMany()
                    .HasForeignKey(x => x.InterviewId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            base.OnModelCreating(builder);
        }
    }
}
