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
}