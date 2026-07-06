using Microsoft.EntityFrameworkCore;
using Notification.Domain.Entities;

namespace Notification.Infrastructure
{
    public class NotificationDbContext : DbContext
    {
        public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options) { }

        public DbSet<Notification.Domain.Entities.Notification> Notifications => Set<Notification.Domain.Entities.Notification>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("notification");
            builder.Entity<Notification.Domain.Entities.Notification>().ToTable("Notifications");
            base.OnModelCreating(builder);
        }
    }
}
