using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Recruitment.Domain.Entities;

namespace Recruitment.Infrastructure.Persistence.Configurations;

public class JobPostingSkillConfiguration : IEntityTypeConfiguration<JobPostingSkill>
{
    public void Configure(EntityTypeBuilder<JobPostingSkill> builder)
    {
        builder.ToTable("JobPostingSkills");
        builder.HasKey(x => new { x.JobPostingId, x.SkillId });

        builder.HasOne(x => x.JobPosting)
            .WithMany(j => j.Skills)
            .HasForeignKey(x => x.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.SkillId);
    }
}
