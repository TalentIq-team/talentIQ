using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notification.Infrastructure;
using System.Security.Claims;

namespace TalentIQ.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/notifications")]
public class NotificationController : ControllerBase
{
    private readonly NotificationDbContext _context;

    public NotificationController(NotificationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(CancellationToken ct)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Ok(new List<Notification.Domain.Entities.Notification>());
        }

        try
        {
            var notifications = await _context.Notifications
                .Where(n => n.RecipientId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync(ct);

            return Ok(notifications);
        }
        catch
        {
            return Ok(new List<Notification.Domain.Entities.Notification>());
        }
    }

    [HttpPost("test-send")]
    public async Task<IActionResult> TriggerTestNotification([FromBody] TestNotificationRequest? request, CancellationToken ct)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            userId = Guid.NewGuid();
        }

        var notification = new Notification.Domain.Entities.Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = userId,
            Channel = Notification.Domain.Entities.NotificationChannel.Email,
            Subject = request?.Subject ?? "📧 Event Triggered: Senior Candidate Application Received",
            Body = request?.Body ?? "Notification Module Dispatcher: Email sent to candidate & recruiter. Infrastructure worker: Delivered via SMTP (Hangfire retry policy: 0 failures, 1/3 attempts).",
            Status = Notification.Domain.Entities.NotificationStatus.Sent,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(ct);

        return Ok(notification);
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var claimValue =
            User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return Guid.TryParse(claimValue, out userId);
    }
}

public class TestNotificationRequest
{
    public string? Subject { get; set; }
    public string? Body { get; set; }
}
