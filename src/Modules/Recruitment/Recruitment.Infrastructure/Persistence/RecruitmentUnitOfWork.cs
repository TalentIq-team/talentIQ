using Recruitment.Application.Common.Interfaces;

namespace Recruitment.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation. Wraps the <see cref="RecruitmentDbContext"/>'s SaveChangesAsync
/// so that all pending mutations tracked in the shared (scoped) context — e.g. an application's
/// stage change and its new stage-history row — are committed atomically in one transaction.
/// </summary>
public class RecruitmentUnitOfWork : IUnitOfWork
{
    private readonly RecruitmentDbContext _dbContext;

    public RecruitmentUnitOfWork(RecruitmentDbContext dbContext) => _dbContext = dbContext;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
