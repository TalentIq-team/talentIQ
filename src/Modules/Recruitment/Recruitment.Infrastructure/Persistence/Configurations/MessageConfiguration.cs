using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Recruitment.Domain.Entities;

namespace Recruitment.Infrastructure.Persistence.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("Messages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();

        builder.Property(x => x.ApplicationId).IsRequired();
        builder.Property(x => x.SenderUserId).IsRequired();
        builder.Property(x => x.Body).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.SentAt).IsRequired();

        builder.HasIndex(x => x.ApplicationId);
    }
}
