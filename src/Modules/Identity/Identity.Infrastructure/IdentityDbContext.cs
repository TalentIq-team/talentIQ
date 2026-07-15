using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure
{
    public class IdentityDbContext : DbContext
    {
        public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Organization> Organizations => Set<Organization>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("identity");
            builder.Entity<User>().ToTable("Users");
            builder.Entity<Organization>().ToTable("Organizations");
            builder.Entity<Department>().ToTable("Departments");
            builder.Entity<AuditLog>().ToTable("AuditLogs");
            base.OnModelCreating(builder);
            builder.Entity<RefreshToken>().ToTable("RefreshTokens");
        }
    }
}
