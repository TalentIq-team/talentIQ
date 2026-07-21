using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentIQ.Api.Services;

namespace TalentIQ.Api.Controllers;

/// <summary>
/// Development-only helper to mint a valid JWT for testing (FR fix #6). The real Identity module
/// issues production tokens; this endpoint returns 404 outside the Development environment so it
/// can never be used in production.
/// </summary>
[ApiController]
[AllowAnonymous]
[Route("api/v1/auth")]
[Produces("application/json")]
public class DevAuthController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly DevTokenService _tokens;

    public DevAuthController(IWebHostEnvironment environment, DevTokenService tokens)
    {
        _environment = environment;
        _tokens = tokens;
    }

    /// <summary>Issue a development JWT. Paste the returned token into Swagger's Authorize box.</summary>
    [HttpPost("dev-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DevToken([FromQuery] Guid? userId)
    {
        if (!_environment.IsDevelopment())
        {
            return NotFound();
        }

        var (token, id, expiresAt) = _tokens.CreateToken(userId);
        return Ok(new
        {
            token,
            userId = id,
            expiresAt,
            usage = "Click Authorize in Swagger and paste ONLY the token value (no 'Bearer ' prefix)."
        });
    }

    /// <summary>Triggers database seeding for sample jobs, candidates, and applications.</summary>
    [HttpPost("seed")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> SeedDatabase([FromServices] ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("DbSeeder");
        await DbSeeder.SeedDatabaseAsync(HttpContext.RequestServices, logger);
        return Ok(new { message = "Database seeded successfully with sample jobs, candidate profiles, and applications." });
    }
}
