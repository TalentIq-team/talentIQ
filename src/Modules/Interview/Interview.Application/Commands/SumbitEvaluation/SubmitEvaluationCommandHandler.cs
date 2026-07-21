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
        var interview = await _repository.GetInterviewByIdAsync(command.InterviewId);

        if (interview is null)
            throw new Exception("Interview not found.");

        if (interview.Status == InterviewStatus.Cancelled)
            throw new Exception("A cancelled interview cannot be evaluated.");

        var evaluation = new CandidateEvaluation
        {
            Id = Guid.NewGuid(),
            InterviewId = command.InterviewId,
            TechnicalScore = command.TechnicalScore,
            BehavioralScore = command.BehavioralScore,
            Recommendation = command.Recommendation
        };

        interview.Status = InterviewStatus.Completed;

        await _repository.AddEvaluationAsync(evaluation);
        await _repository.UpdateInterviewAsync(interview);
        await _repository.SaveChangesAsync();
    }
}