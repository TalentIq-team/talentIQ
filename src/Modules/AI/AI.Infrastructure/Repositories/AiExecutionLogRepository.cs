using AI.Application.Interfaces;
using AI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AI.Infrastructure.Repositories;

public class AiExecutionLogRepository : IAiExecutionLogRepository
{
    private readonly AiDbContext _db;

    public AiExecutionLogRepository(AiDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(AiExecutionLog log, CancellationToken ct = default)
    {
        _db.AiExecutionLogs.Add(log);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<AiExecutionLog>> GetRecentAsync(int count = 50, CancellationToken ct = default)
    {
        return await _db.AiExecutionLogs
            .OrderByDescending(l => l.ExecutedAt)
            .Take(count)
            .ToListAsync(ct);
    }
}
