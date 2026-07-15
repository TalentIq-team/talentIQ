using Candidate.Application.Common.Interfaces;
using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Candidate.Infrastructure.Persistence;

/// <summary>
/// EF Core DbContext for the Candidate module (schema: <c>candidate</c>).
/// Implements <see cref="ICandidateDbContext"/> so application handlers depend on the abstraction.
/// </summary>
public class CandidateDbContext : DbContext, ICandidateDbContext
{
    public const string Schema = "candidate";

    public CandidateDbContext(DbContextOptions<CandidateDbContext> options) : base(options)
    {
    }

    public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasDefaultSchema(Schema);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(builder);
    }
}
