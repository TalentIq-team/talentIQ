using AI.Domain.Entities;

namespace AI.Application.Interfaces;

public interface IResumeAnalysisRepository
{
    Task AddAsync(ResumeAnalysis analysis, CancellationToken ct = default);
    Task<ResumeAnalysis?> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default);
}
