using Interview.Application.Interfaces;

namespace Interview.Application.Commands.RescheduleInterview;

public class RescheduleInterviewCommandHandler
{
    private readonly IInterviewRepository _repository;

    public RescheduleInterviewCommandHandler(IInterviewRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(RescheduleInterviewCommand command)
    {
        var interview = await _repository.GetInterviewByIdAsync(command.InterviewId);

        if (interview == null)
            throw new Exception("Interview not found.");

        interview.ScheduledStartTime = command.NewScheduledTime;
        interview.MeetingLink = command.NewMeetingLink;

        await _repository.UpdateInterviewAsync(interview);
        await _repository.SaveChangesAsync();
    }
}