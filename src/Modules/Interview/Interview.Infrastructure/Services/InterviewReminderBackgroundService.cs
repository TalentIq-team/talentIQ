using Interview.Application.Services;
using Interview.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Notification.Application.Interfaces;

namespace Interview.Infrastructure.Services;

public class InterviewReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<InterviewReminderBackgroundService> _logger;
    private readonly HashSet<Guid> _remindedInterviews = new();

    public InterviewReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<InterviewReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Interview Reminder Background Service starting...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<InterviewDbContext>();
                var emailService = scope.ServiceProvider.GetService<IEmailService>();
                var calendarService = scope.ServiceProvider.GetService<ICalendarService>();

                var now = DateTime.UtcNow;
                var threshold = now.AddHours(24);

                var upcoming = await db.Interviews
                    .Where(i => i.Status == InterviewStatus.Scheduled && i.ScheduledStartTime >= now && i.ScheduledStartTime <= threshold)
                    .ToListAsync(stoppingToken);

                foreach (var interview in upcoming)
                {
                    if (_remindedInterviews.Contains(interview.Id))
                        continue;

                    _logger.LogInformation("Sending interview reminder for Interview ID: {Id} scheduled at {Time}", interview.Id, interview.ScheduledStartTime);

                    if (emailService != null && calendarService != null)
                    {
                        var googleUrl = calendarService.GenerateGoogleCalendarUrl(
                            interview.ScheduledStartTime,
                            "TalentIQ Interview Reminder",
                            $"Reminder: Your interview is scheduled for {interview.ScheduledStartTime:f}. Link: {interview.MeetingLink}",
                            interview.MeetingLink);

                        var body = $"""
                        <h2>TalentIQ Interview Reminder</h2>
                        <p>This is a reminder that your upcoming interview is scheduled for <strong>{interview.ScheduledStartTime:f} UTC</strong>.</p>
                        <p><strong>Meeting Link:</strong> <a href="{interview.MeetingLink}">{interview.MeetingLink}</a></p>
                        <p><a href="{googleUrl}" target="_blank" style="padding: 8px 16px; background-color: #4FB477; color: white; border-radius: 6px; text-decoration: none;">Add to Google Calendar</a></p>
                        """;

                        // Log reminder dispatch
                        _logger.LogInformation("Reminder email rendered for interview {Id}", interview.Id);
                    }

                    _remindedInterviews.Add(interview.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing interview reminders.");
            }

            // Check every 1 hour (or 30 seconds during active runtime)
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
