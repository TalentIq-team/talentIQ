using Interview.Application.Interfaces;
using Interview.Domain.Entities;
using MediatR;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Interview.Application.Commands.RescheduleInterview;

public class RescheduleInterviewCommandHandler : IRequestHandler<RescheduleInterviewCommand>
{
    private readonly IInterviewRepository _repository;

    public RescheduleInterviewCommandHandler(IInterviewRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(RescheduleInterviewCommand command, CancellationToken cancellationToken)
    {
        var interview = await _repository.GetInterviewByIdAsync(command.InterviewId)
            ?? throw new NotFoundException($"Interview '{command.InterviewId}' was not found.");

        if (interview.Status == InterviewStatus.Cancelled)
        {
            throw new ConflictException("A cancelled interview cannot be rescheduled.");
        }

        interview.ScheduledStartTime = command.NewScheduledTime;
        interview.MeetingLink = command.NewMeetingLink;

        await _repository.UpdateInterviewAsync(interview);
        await _repository.SaveChangesAsync();
    }
}
