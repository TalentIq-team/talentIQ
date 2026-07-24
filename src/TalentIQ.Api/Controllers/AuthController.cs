using Candidate.Application.Common.Interfaces;
using Identity.Application.Commands;
using Identity.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TalentIQ.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ICandidateDbContext _candidateDb;

    public AuthController(ISender sender, ICandidateDbContext candidateDb)
    {
        _sender = sender;
        _candidateDb = candidateDb;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResultDto>> Register(
        [FromBody] RegisterUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _sender.Send(
                new RegisterUserCommand(
                    request.Email,
                    request.Password),
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

    [HttpPost("login")]
    public async Task<ActionResult<AuthResultDto>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _sender.Send(
                new LoginCommand(
                    request.Email,
                    request.Password),
                cancellationToken);

            var candidateProfile = await _candidateDb.CandidateProfiles
                .AsNoTracking()
                .Where(p => p.UserId == result.UserId)
                .Select(p => new { p.Id })
                .FirstOrDefaultAsync(cancellationToken);

            result.CandidateProfileId = candidateProfile?.Id;

            return Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { message = exception.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResultDto>> Refresh(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _sender.Send(
                new RefreshAccessTokenCommand(
                    request.RefreshToken),
                cancellationToken);

            return Ok(result);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { message = exception.Message });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _sender.Send(
                new LogoutCommand(request.RefreshToken),
                cancellationToken);

            return NoContent();
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { message = exception.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _sender.Send(
                new ForgotPasswordCommand(request.Email),
                cancellationToken);

            return Ok(new { message = "If your email is registered, you will receive a reset code." });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            await _sender.Send(
                new ResetPasswordCommand(
                    request.Email,
                    request.Token,
                    request.NewPassword),
                cancellationToken);

            return Ok(new { message = "Password reset successfully. You can now sign in with your new password." });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}