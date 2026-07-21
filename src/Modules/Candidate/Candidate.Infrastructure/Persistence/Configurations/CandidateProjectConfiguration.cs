using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateProjectConfiguration : IEntityTypeConfiguration<CandidateProject>
{
    public void Configure(EntityTypeBuilder<CandidateProject> builder)
    {
        builder.ToTable("CandidateProjects");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.ProjectName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(3000);
        builder.Property(x => x.Role).HasMaxLength(150);
        builder.Property(x => x.Technologies).HasMaxLength(1000);
        builder.Property(x => x.GitHubUrl).HasMaxLength(1000);
        builder.Property(x => x.LiveDemoUrl).HasMaxLength(1000);

        builder.HasOne(x => x.CandidateProfile)
            .WithMany(x => x.Projects)
            .HasForeignKey(x => x.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
