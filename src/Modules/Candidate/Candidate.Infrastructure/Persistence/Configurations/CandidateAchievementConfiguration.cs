using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateAchievementConfiguration : IEntityTypeConfiguration<CandidateAchievement>
{
    public void Configure(EntityTypeBuilder<CandidateAchievement> builder)
    {
        builder.ToTable("CandidateAchievements");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.IssuedBy).HasMaxLength(200);

        builder.HasOne(x => x.CandidateProfile)
            .WithMany(x => x.Achievements)
            .HasForeignKey(x => x.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
