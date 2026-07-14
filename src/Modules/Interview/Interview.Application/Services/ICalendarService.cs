namespace Interview.Application.Services;

public interface ICalendarService
{
    byte[] GenerateInterviewInvite(
        DateTime startTime,
        string meetingLink);
}