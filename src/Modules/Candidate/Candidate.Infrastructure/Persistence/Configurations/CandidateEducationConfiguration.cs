using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateEducationConfiguration : IEntityTypeConfiguration<CandidateEducation>
{
    public void Configure(EntityTypeBuilder<CandidateEducation> builder)
    {
        builder.ToTable("CandidateEducations");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Institution).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Degree).IsRequired().HasMaxLength(200);
        builder.Property(x => x.FieldOfStudy).HasMaxLength(200);
        builder.Property(x => x.GPA).HasMaxLength(50);
        builder.Property(x => x.Description).HasMaxLength(2000);

        builder.HasOne(x => x.CandidateProfile)
            .WithMany(x => x.Educations)
            .HasForeignKey(x => x.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
