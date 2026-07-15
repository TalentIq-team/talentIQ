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

    Task SaveChangesAsync();
}