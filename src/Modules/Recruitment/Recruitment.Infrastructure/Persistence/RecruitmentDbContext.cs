using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;
using System.Reflection;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace Recruitment.Infrastructure.Persistence;

/// <summary>
/// EF Core DbContext for the Recruitment module (schema: <c>recruitment</c>).
/// Implements <see cref="IRecruitmentDbContext"/> for handlers.
/// </summary>
public class RecruitmentDbContext : DbContext, IRecruitmentDbContext
{
    public const string Schema = "recruitment";

    public RecruitmentDbContext(DbContextOptions<RecruitmentDbContext> options) : base(options)
    {
    }

    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<JobPostingSkill> JobPostingSkills => Set<JobPostingSkill>();
    public DbSet<ApplicationEntity> Applications => Set<ApplicationEntity>();
    public DbSet<ApplicationStageHistory> ApplicationStageHistory => Set<ApplicationStageHistory>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<ApplicationAnalysis> ApplicationAnalyses => Set<ApplicationAnalysis>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasDefaultSchema(Schema);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(builder);
    }
}
