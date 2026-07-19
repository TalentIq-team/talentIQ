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
            return Unauthorized(new { message = "User not authenticated" });
        }

        // Fetch notifications for this recipient
        var notifications = await _context.Notifications
            .Where(n => n.RecipientId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(ct);

        return Ok(notifications);
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
