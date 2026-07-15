using AI.Domain.Entities;

namespace AI.Application.Interfaces;

public interface IInterviewQuestionSetRepository
{
    Task AddAsync(InterviewQuestionSet set, CancellationToken ct = default);
    Task<InterviewQuestionSet?> GetByApplicationIdAsync(Guid applicationId, CancellationToken ct = default);
}
