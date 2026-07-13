using Identity.Application.Commands;
using Identity.Application.DTOs;
using Identity.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TalentIQ.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController : ControllerBase
{
    private readonly ISender _sender;

    public AdminController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "Admin access granted." });
    }

    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<AdminUserDto>>> GetUsers(
        CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(
            new GetAllUsersQuery(),
            cancellationToken));
    }

    [HttpPost("users")]
    public async Task<ActionResult<AdminUserDto>> CreateUser(
        CreateStaffUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _sender.Send(
                new CreateStaffUserCommand(
                    request.Email,
                    request.Password,
                    request.Role,
                    request.OrganizationId,
                    request.DepartmentId),
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
    public async Task<ActionResult<AdminUserDto>> ChangeRole(
        Guid id,
        ChangeUserRoleRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _sender.Send(
                new ChangeUserRoleCommand(id, request.Role),
                cancellationToken));
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPatch("users/{id:guid}/deactivate")]
    public async Task<ActionResult<AdminUserDto>> Deactivate(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _sender.Send(
                new DeactivateUserCommand(id),
                cancellationToken));
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }
}
