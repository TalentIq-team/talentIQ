using Interview.Application.Interfaces;
using Interview.Domain.Entities;
using MediatR;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Interview.Application.Commands.CancelInterview;

public class CancelInterviewCommandHandler : IRequestHandler<CancelInterviewCommand>
{
    private readonly IInterviewRepository _repository;

    public CancelInterviewCommandHandler(IInterviewRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(CancelInterviewCommand command, CancellationToken cancellationToken)
    {
        var interview = await _repository.GetInterviewByIdAsync(command.InterviewId)
            ?? throw new NotFoundException($"Interview '{command.InterviewId}' was not found.");

        if (interview.Status == InterviewStatus.Cancelled)
        {
            throw new ConflictException("This interview is already cancelled.");
        }

        if (interview.Status == InterviewStatus.Completed)
        {
            throw new ConflictException("A completed interview cannot be cancelled.");
        }

        interview.Status = InterviewStatus.Cancelled;
        interview.CancellationReason = command.CancellationReason;
        interview.CancelledAt = DateTime.UtcNow;

        await _repository.UpdateInterviewAsync(interview);
        await _repository.SaveChangesAsync();
    }
}
