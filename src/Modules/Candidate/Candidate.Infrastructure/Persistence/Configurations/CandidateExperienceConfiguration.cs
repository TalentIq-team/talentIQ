using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateExperienceConfiguration : IEntityTypeConfiguration<CandidateExperience>
{
    public void Configure(EntityTypeBuilder<CandidateExperience> builder)
    {
        builder.ToTable("CandidateExperiences");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Company).IsRequired().HasMaxLength(200);
        builder.Property(x => x.JobTitle).IsRequired().HasMaxLength(200);
        builder.Property(x => x.EmploymentType).HasMaxLength(100);
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.Responsibilities).HasMaxLength(4000);
        builder.Property(x => x.Achievements).HasMaxLength(4000);
        builder.Property(x => x.TechnologiesUsed).HasMaxLength(1000);

        builder.HasOne(x => x.CandidateProfile)
            .WithMany(x => x.Experiences)
            .HasForeignKey(x => x.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
