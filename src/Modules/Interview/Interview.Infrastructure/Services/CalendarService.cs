using System.Text;
using Interview.Application.Services;

namespace Interview.Infrastructure.Services;

public class CalendarService : ICalendarService
{
    public byte[] GenerateInterviewInvite(
        DateTime startTime,
        string meetingLink)
    {
        var endTime = startTime.AddHours(1);

        var ics = $"""
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TalentIQ//Interview//EN
BEGIN:VEVENT
UID:{Guid.NewGuid()}
DTSTAMP:{DateTime.UtcNow:yyyyMMddTHHmmssZ}
DTSTART:{startTime.ToUniversalTime():yyyyMMddTHHmmssZ}
DTEND:{endTime.ToUniversalTime():yyyyMMddTHHmmssZ}
SUMMARY:TalentIQ Interview
DESCRIPTION:Interview Meeting\nMeeting Link: {meetingLink}
LOCATION:{meetingLink}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR
""";

        return Encoding.UTF8.GetBytes(ics);
    }

    public string GenerateGoogleCalendarUrl(
        DateTime startTime,
        string title,
        string description,
        string location)
    {
        var endTime = startTime.AddHours(1);
        var startIso = startTime.ToUniversalTime().ToString("yyyyMMddTHHmmssZ");
        var endIso = endTime.ToUniversalTime().ToString("yyyyMMddTHHmmssZ");

        var encodedTitle = Uri.EscapeDataString(title);
        var encodedDetails = Uri.EscapeDataString(description);
        var encodedLocation = Uri.EscapeDataString(location);

        return $"https://calendar.google.com/calendar/render?action=TEMPLATE&text={encodedTitle}&dates={startIso}/{endIso}&details={encodedDetails}&location={encodedLocation}";
    }
}