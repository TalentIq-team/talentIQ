using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Recruitment.Domain.Entities;

namespace Recruitment.Infrastructure.Persistence.Configurations;

public class JobPostingConfiguration : IEntityTypeConfiguration<JobPosting>
{
    public void Configure(EntityTypeBuilder<JobPosting> builder)
    {
        builder.ToTable("JobPostings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.OrganizationId).IsRequired();
        builder.Property(x => x.RecruiterId).IsRequired();
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(8000);
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.EmploymentType).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.MinExperienceYears).IsRequired();

        var skills = builder.Metadata.FindNavigation(nameof(JobPosting.Skills))!;
        skills.SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(x => x.OrganizationId);
        builder.HasIndex(x => x.Status);
    }
}
