using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateCertificationConfiguration : IEntityTypeConfiguration<CandidateCertification>
{
    public void Configure(EntityTypeBuilder<CandidateCertification> builder)
    {
        builder.ToTable("CandidateCertifications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Organization).IsRequired().HasMaxLength(200);
        builder.Property(x => x.CredentialId).HasMaxLength(150);
        builder.Property(x => x.CredentialUrl).HasMaxLength(1000);

        builder.HasOne(x => x.CandidateProfile)
            .WithMany(x => x.Certifications)
            .HasForeignKey(x => x.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
