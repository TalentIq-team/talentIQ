using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Recruitment.Domain.Entities;

namespace Recruitment.Infrastructure.Persistence.Configurations;

public class ApplicationStageHistoryConfiguration : IEntityTypeConfiguration<ApplicationStageHistory>
{
    public void Configure(EntityTypeBuilder<ApplicationStageHistory> builder)
    {
        builder.ToTable("ApplicationStageHistory");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.ApplicationId).IsRequired();
        builder.Property(x => x.FromStage).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(x => x.ToStage).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(x => x.ChangedAt).IsRequired();
        builder.Property(x => x.Note).HasMaxLength(1000);

        builder.HasIndex(x => x.ApplicationId);
    }
}
