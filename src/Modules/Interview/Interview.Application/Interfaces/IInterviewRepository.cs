using Interview.Domain.Entities;
using InterviewEntity = Interview.Domain.Entities.Interview;

namespace Interview.Application.Interfaces;

public interface IInterviewRepository
{
    Task AddInterviewAsync(InterviewEntity interview);

    Task<InterviewEntity?> GetInterviewByIdAsync(Guid id);

    Task<List<InterviewEntity>> GetAllInterviewsAsync();

    Task UpdateInterviewAsync(InterviewEntity interview);

    Task AddEvaluationAsync(CandidateEvaluation evaluation);

    Task<CandidateEvaluation?> GetEvaluationByInterviewIdAsync(Guid interviewId);

    /// <summary>Application ids that already have a non-cancelled interview, used by the shortlist view.</summary>
    Task<List<Guid>> GetScheduledApplicationIdsAsync();

    Task SaveChangesAsync();
}
