using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Recruitment.Domain.Entities;

namespace Recruitment.Infrastructure.Persistence.Configurations;

public class ApplicationAnalysisConfiguration : IEntityTypeConfiguration<ApplicationAnalysis>
{
    public void Configure(EntityTypeBuilder<ApplicationAnalysis> builder)
    {
        builder.ToTable("ApplicationAnalyses");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.ApplicationId).IsRequired();
        builder.Property(x => x.MatchScore).HasPrecision(5, 2);
        builder.Property(x => x.MatchedSkillIdsCsv).HasMaxLength(4000);
        builder.Property(x => x.MissingSkillIdsCsv).HasMaxLength(4000);
        builder.Property(x => x.Explanation).HasMaxLength(2000);
        builder.Property(x => x.AnalyzedAt).IsRequired();

        // Ignore the parsed convenience projections (persist only the CSV backing columns).
        builder.Ignore(x => x.MatchedSkillIds);
        builder.Ignore(x => x.MissingSkillIds);

        // One analysis per application.
        builder.HasIndex(x => x.ApplicationId).IsUnique();
    }
}
