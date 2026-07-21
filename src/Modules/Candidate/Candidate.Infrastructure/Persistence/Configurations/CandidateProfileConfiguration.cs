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

        builder.Property(x => x.PreferredName).HasMaxLength(200);
        builder.Property(x => x.ProfilePictureUrl).HasMaxLength(2048);
        builder.Property(x => x.Gender).HasMaxLength(50);
        builder.Property(x => x.Nationality).HasMaxLength(100);
        builder.Property(x => x.Address).HasMaxLength(500);
        builder.Property(x => x.City).HasMaxLength(100);
        builder.Property(x => x.Country).HasMaxLength(100);
        builder.Property(x => x.PostalCode).HasMaxLength(50);
        builder.Property(x => x.TimeZone).HasMaxLength(100);

        builder.Property(x => x.Headline).HasMaxLength(300);
        builder.Property(x => x.CurrentJobTitle).HasMaxLength(200);
        builder.Property(x => x.CurrentCompany).HasMaxLength(200);

        builder.Property(x => x.LinkedInUrl).HasMaxLength(500);
        builder.Property(x => x.GitHubUrl).HasMaxLength(500);
        builder.Property(x => x.PortfolioUrl).HasMaxLength(500);
        builder.Property(x => x.StackOverflowUrl).HasMaxLength(500);
        builder.Property(x => x.BehanceUrl).HasMaxLength(500);
        builder.Property(x => x.MediumUrl).HasMaxLength(500);
        builder.Property(x => x.TwitterUrl).HasMaxLength(500);

        builder.Property(x => x.PreferredJobTitles).HasMaxLength(1000);
        builder.Property(x => x.PreferredLocations).HasMaxLength(1000);
        builder.Property(x => x.ExpectedSalary).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasMaxLength(10);
        builder.Property(x => x.EmploymentTypePreference).HasMaxLength(100);
        builder.Property(x => x.WorkMode).HasMaxLength(100);
        builder.Property(x => x.NoticePeriod).HasMaxLength(100);

        // Navigation mappings
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Skills))?.SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Experiences))?.SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Educations))?.SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Projects))?.SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Certifications))?.SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Languages))?.SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Achievements))?.SetPropertyAccessMode(PropertyAccessMode.Field);
        builder.Metadata.FindNavigation(nameof(CandidateProfile.Documents))?.SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(x => x.UserId);
    }
}
