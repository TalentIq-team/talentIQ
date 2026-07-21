using Candidate.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Candidate.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the Candidate persistence store, letting application handlers
/// remain free of a concrete EF Core DbContext (implemented in Candidate.Infrastructure).
/// </summary>
public interface ICandidateDbContext
{
    DbSet<CandidateProfile> CandidateProfiles { get; }
    DbSet<Skill> Skills { get; }
    DbSet<CandidateSkill> CandidateSkills { get; }
    DbSet<CandidateDocument> CandidateDocuments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
