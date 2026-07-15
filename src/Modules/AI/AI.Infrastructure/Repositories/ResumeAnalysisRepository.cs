using AI.Application.Interfaces;
using AI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AI.Infrastructure.Repositories;

public class ResumeAnalysisRepository : IResumeAnalysisRepository
{
    private readonly AiDbContext _db;

    public ResumeAnalysisRepository(AiDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(ResumeAnalysis analysis, CancellationToken ct = default)
    {
        _db.ResumeAnalyses.Add(analysis);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<ResumeAnalysis?> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default)
    {
        return await _db.ResumeAnalyses
            .Where(a => a.ApplicationId == applicationId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }
}
