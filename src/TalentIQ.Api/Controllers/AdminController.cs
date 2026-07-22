using System.Security.Claims;
using Identity.Application.Commands;
using Identity.Application.DTOs;
using Identity.Application.Queries;
using Identity.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TalentIQ.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize]
public sealed class AdminController : ControllerBase
{
    private readonly ISender _sender;

    public AdminController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("ping")]
    [Authorize(Roles = "Admin")]
    public IActionResult Ping()
    {
        return Ok(new { message = "Admin access granted." });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<ActionResult<IReadOnlyList<AdminUserDto>>> GetUsers(
        CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(
            new GetAllUsersQuery(),
            cancellationToken));
    }

    [HttpGet("monitoring")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SystemMonitoringDto>> GetMonitoring(
        CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(
            new GetSystemMonitoringQuery(),
            cancellationToken));
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin,Recruiter")]
    public async Task<ActionResult<AdminUserDto>> CreateUser(
        CreateStaffUserRequest request,
        CancellationToken cancellationToken)
    {
        if (User.IsInRole("Recruiter") &&
            request.Role == UserRole.Admin)
        {
            return Forbid();
        }

        if (!TryGetCurrentUserId(out var actorUserId))
        {
            return Unauthorized(new
            {
                message = "Authenticated user ID was not found."
            });
        }

        try
        {
            var result = await _sender.Send(
                new CreateStaffUserCommand(
                    request.Email,
                    request.Password,
                    request.Role,
                    request.OrganizationId,
                    request.DepartmentId,
                    actorUserId,
                    GetIpAddress()),
                cancellationToken);

            return Ok(result);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPatch("users/{id:guid}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminUserDto>> ChangeRole(
        Guid id,
        ChangeUserRoleRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var actorUserId))
        {
            return Unauthorized(new
            {
                message = "Authenticated user ID was not found."
            });
        }

        try
        {
            return Ok(await _sender.Send(
                new ChangeUserRoleCommand(
                    id,
                    request.Role,
                    actorUserId,
                    GetIpAddress()),
                cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPatch("users/{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminUserDto>> Deactivate(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var actorUserId))
        {
            return Unauthorized(new
            {
                message = "Authenticated user ID was not found."
            });
        }

        try
        {
            return Ok(await _sender.Send(
                new DeactivateUserCommand(
                    id,
                    actorUserId,
                    GetIpAddress()),
                cancellationToken));
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var claimValue =
            User.FindFirstValue("userId")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return Guid.TryParse(claimValue, out userId);
    }

    private string? GetIpAddress()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}
