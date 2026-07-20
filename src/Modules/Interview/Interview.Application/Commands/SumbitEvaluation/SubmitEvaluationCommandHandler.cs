using Interview.Application.Interfaces;
using Interview.Domain.Entities;
using MediatR;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Interview.Application.Commands.SubmitEvaluation;

public class SubmitEvaluationCommandHandler : IRequestHandler<SubmitEvaluationCommand, Guid>
{
    private readonly IInterviewRepository _repository;

    public SubmitEvaluationCommandHandler(IInterviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(SubmitEvaluationCommand command, CancellationToken cancellationToken)
    {
        var interview = await _repository.GetInterviewByIdAsync(command.InterviewId)
            ?? throw new NotFoundException($"Interview '{command.InterviewId}' was not found.");

        if (interview.Status == InterviewStatus.Cancelled)
        {
            throw new ConflictException("A cancelled interview cannot be evaluated.");
        }

        var existing = await _repository.GetEvaluationByInterviewIdAsync(command.InterviewId);

        if (existing is not null)
        {
            throw new ConflictException("This interview has already been evaluated.");
        }

        var evaluation = new CandidateEvaluation
        {
            Id = Guid.NewGuid(),
            InterviewId = command.InterviewId,
            TechnicalScore = command.TechnicalScore,
            BehavioralScore = command.BehavioralScore,
            OverallScore = command.OverallScore,
            Comments = command.Comments,
            Recommendation = command.Recommendation,
            SubmittedAt = DateTime.UtcNow
        };

        await _repository.AddEvaluationAsync(evaluation);

        // Submitting an evaluation closes out the interview.
        interview.Status = InterviewStatus.Completed;
        await _repository.UpdateInterviewAsync(interview);

        await _repository.SaveChangesAsync();

        return evaluation.Id;
    }
}
