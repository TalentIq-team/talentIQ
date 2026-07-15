namespace Recruitment.Application.Common.Interfaces;

/// <summary>
/// Unit of Work abstraction. Wraps EF Core's SaveChangesAsync so that multiple
/// domain operations (e.g. updating an application's stage AND inserting a stage-history
/// row) are committed atomically in a single transaction/save.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
