using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateProfileConfiguration : IEntityTypeConfiguration<CandidateProfile>
{
    public void Configure(EntityTypeBuilder<CandidateProfile> builder)
    {
        builder.ToTable("CandidateProfiles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.ProfessionalSummary).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.ResumeBlobUrl).HasMaxLength(2048);
        builder.Property(x => x.YearsOfExperience).HasPrecision(5, 2);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();

        // Map the read-only Skills navigation to its backing field (_skills).
        var skills = builder.Metadata.FindNavigation(nameof(CandidateProfile.Skills))!;
        skills.SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(x => x.UserId);
    }
}
