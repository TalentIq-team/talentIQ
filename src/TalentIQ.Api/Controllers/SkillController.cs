using Candidate.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TalentIQ.Api.Controllers;

/// <summary>Lookup list of available technical skills for profile/job skill selection.</summary>
[ApiController]
[Authorize]
[Route("api/v1/skills")]
[Produces("application/json")]
public class SkillController : ControllerBase
{
    private readonly ICandidateDbContext _db;

    public SkillController(ICandidateDbContext db) => _db = db;

    /// <summary>List all available skills (for populating skill-picker dropdowns).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SkillDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var skills = await _db.Skills
            .AsNoTracking()
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Name)
            .Select(s => new SkillDto(s.Id, s.Name, s.Category))
            .ToListAsync(ct);

        return Ok(skills);
    }
}

public record SkillDto(Guid Id, string Name, string Category);