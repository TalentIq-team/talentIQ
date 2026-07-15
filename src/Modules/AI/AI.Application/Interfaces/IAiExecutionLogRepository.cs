using AI.Domain.Entities;

namespace AI.Application.Interfaces;

public interface IAiExecutionLogRepository
{
    Task AddAsync(AiExecutionLog log, CancellationToken ct = default);
    Task<List<AiExecutionLog>> GetRecentAsync(int count = 50, CancellationToken ct = default);
}
