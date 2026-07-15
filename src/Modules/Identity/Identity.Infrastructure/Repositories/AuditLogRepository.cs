using Identity.Application.Interfaces;
using Identity.Domain.Entities;

namespace Identity.Infrastructure.Repositories;

public sealed class AuditLogRepository : IAuditLogRepository
{
    private readonly IdentityDbContext _dbContext;

    public AuditLogRepository(IdentityDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        AuditLog auditLog,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.AuditLogs.AddAsync(
            auditLog,
            cancellationToken);
    }
}
