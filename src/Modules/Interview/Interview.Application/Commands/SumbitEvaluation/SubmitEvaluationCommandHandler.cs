using Interview.Application.Interfaces;
using Interview.Domain.Entities;

namespace Interview.Application.Commands.SubmitEvaluation;

public class SubmitEvaluationCommandHandler
{
    private readonly IInterviewRepository _repository;

    public SubmitEvaluationCommandHandler(IInterviewRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(SubmitEvaluationCommand command)
    {
        var evaluation = new CandidateEvaluation
        {
            Id = Guid.NewGuid(),
            InterviewId = command.InterviewId,
            TechnicalScore = command.TechnicalScore,
            BehavioralScore = command.BehavioralScore,
            Recommendation = command.Recommendation
        };

        await _repository.AddEvaluationAsync(evaluation);
        await _repository.SaveChangesAsync();
    }
}