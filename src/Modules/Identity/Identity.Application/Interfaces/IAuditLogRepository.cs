using Identity.Domain.Entities;

namespace Identity.Application.Interfaces;

public interface IAuditLogRepository
{
    Task AddAsync(
        AuditLog auditLog,
        CancellationToken cancellationToken = default);
}
