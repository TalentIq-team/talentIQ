using Interview.Application.Interfaces;
using Interview.Application.Services;
using Interview.Domain.Entities;
using Notification.Application.Interfaces;

namespace Interview.Application.Commands.ScheduleInterview;

public class ScheduleInterviewCommandHandler
{
    private readonly IInterviewRepository _repository;
    private readonly IEmailService _emailService;
    private readonly ICalendarService _calendarService;

    public ScheduleInterviewCommandHandler(
        IInterviewRepository repository,
        IEmailService emailService,
        ICalendarService calendarService)
    {
        _repository = repository;
        _emailService = emailService;
        _calendarService = calendarService;
    }

    public async Task Handle(ScheduleInterviewCommand command)
    {
        var interview = new Interview.Domain.Entities.Interview
        {
            Id = Guid.NewGuid(),
            ApplicationId = command.ApplicationId,
            InterviewerUserId = command.InterviewerUserId,
            ScheduledStartTime = command.ScheduledStartTime,
            MeetingLink = command.MeetingLink,
            Status = InterviewStatus.Scheduled
        };

        await _repository.AddInterviewAsync(interview);
        await _repository.SaveChangesAsync();

        var body = $@"
<h2>Interview Invitation</h2>

<p>Your interview has been scheduled.</p>

<p><strong>Date & Time:</strong> {command.ScheduledStartTime}</p>

<p><strong>Meeting Link:</strong></p>

<a href='{command.MeetingLink}'>
{command.MeetingLink}
</a>

<br/><br/>

<p>Please find the calendar invitation attached.</p>

<p>Good luck!</p>";

        var calendarFile = _calendarService.GenerateInterviewInvite(
            command.ScheduledStartTime,
            command.MeetingLink);

        await _emailService.SendEmailAsync(
            command.CandidateEmail,
            "Interview Scheduled",
            body,
            calendarFile,
            "Interview.ics");
    }
}