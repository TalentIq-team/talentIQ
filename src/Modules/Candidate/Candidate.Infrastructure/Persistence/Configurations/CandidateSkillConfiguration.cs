using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateSkillConfiguration : IEntityTypeConfiguration<CandidateSkill>
{
    public void Configure(EntityTypeBuilder<CandidateSkill> builder)
    {
        builder.ToTable("CandidateSkills");
        builder.HasKey(x => new { x.CandidateProfileId, x.SkillId });

        builder.Property(x => x.ProficiencyLevel).HasMaxLength(50);
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.YearsOfExperience).HasPrecision(5, 2);
        builder.Property(x => x.LastUsed).HasMaxLength(50);

        builder.HasOne(x => x.CandidateProfile)
            .WithMany(p => p.Skills)
            .HasForeignKey(x => x.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Skill)
            .WithMany()
            .HasForeignKey(x => x.SkillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
