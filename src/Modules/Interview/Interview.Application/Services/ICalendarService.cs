namespace Interview.Application.Services;

public interface ICalendarService
{
    byte[] GenerateInterviewInvite(
        DateTime startTime,
        string meetingLink);

    string GenerateGoogleCalendarUrl(
        DateTime startTime,
        string title,
        string description,
        string location);
}