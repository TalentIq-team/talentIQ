using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Candidate.Infrastructure
{
    public class CandidateDbContext : DbContext
    {
        public CandidateDbContext(DbContextOptions<CandidateDbContext> options) : base(options) { }

        public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
        public DbSet<Skill> Skills => Set<Skill>();
        public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("candidate");
            builder.Entity<CandidateProfile>().ToTable("CandidateProfiles");
            builder.Entity<Skill>().ToTable("Skills");
            builder.Entity<CandidateSkill>().ToTable("CandidateSkills");
            builder.Entity<CandidateSkill>().HasKey(x => new { x.CandidateProfileId, x.SkillId });
            base.OnModelCreating(builder);
        }
    }
}
