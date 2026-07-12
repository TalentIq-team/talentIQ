using Microsoft.EntityFrameworkCore;
using Recruitment.Domain.Entities;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace Recruitment.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the Recruitment persistence store for application handlers.
/// Implemented by RecruitmentDbContext in Recruitment.Infrastructure.
/// </summary>
public interface IRecruitmentDbContext
{
    DbSet<JobPosting> JobPostings { get; }
    DbSet<JobPostingSkill> JobPostingSkills { get; }
    DbSet<ApplicationEntity> Applications { get; }
    DbSet<ApplicationStageHistory> ApplicationStageHistory { get; }
    DbSet<Message> Messages { get; }
    DbSet<ApplicationAnalysis> ApplicationAnalyses { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
