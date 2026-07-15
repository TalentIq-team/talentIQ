using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Recruitment.Domain.Entities;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace Recruitment.Infrastructure.Persistence.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<ApplicationEntity>
{
    public void Configure(EntityTypeBuilder<ApplicationEntity> builder)
    {
        builder.ToTable("Applications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.JobPostingId).IsRequired();
        builder.Property(x => x.CandidateProfileId).IsRequired();
        builder.Property(x => x.Stage).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(x => x.AiMatchScore).HasPrecision(5, 2);
        builder.Property(x => x.AppliedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();

        // Required composite index (JobPostingId, Stage) for pipeline queries.
        builder.HasIndex(x => new { x.JobPostingId, x.Stage });

        // Supports the "one active application per job per candidate" lookup.
        builder.HasIndex(x => new { x.JobPostingId, x.CandidateProfileId });

        var history = builder.Metadata.FindNavigation(nameof(ApplicationEntity.StageHistory))!;
        history.SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.StageHistory)
            .WithOne()
            .HasForeignKey(h => h.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
