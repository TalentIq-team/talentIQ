using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Candidate.Infrastructure.Persistence.Configurations;

public class CandidateLanguageConfiguration : IEntityTypeConfiguration<CandidateLanguage>
{
    public void Configure(EntityTypeBuilder<CandidateLanguage> builder)
    {
        builder.ToTable("CandidateLanguages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.Language).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ReadingLevel).HasMaxLength(50);
        builder.Property(x => x.WritingLevel).HasMaxLength(50);
        builder.Property(x => x.SpeakingLevel).HasMaxLength(50);

        builder.HasOne(x => x.CandidateProfile)
            .WithMany(x => x.Languages)
            .HasForeignKey(x => x.CandidateProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
