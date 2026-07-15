using Candidate.Application.Candidates.Commands.CreateCandidateProfile;
using Candidate.Application.Candidates.Commands.UpdateCandidateProfile;
using Candidate.Application.Candidates.Commands.UploadResume;
using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Candidates.Queries.GetCandidateProfileById;
using Candidate.Application.Candidates.Queries.SearchCandidates;
using Candidate.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Application.JobPostings.Queries.GetRecommendedJobs;
using TalentIQ.Api.Extensions;

namespace TalentIQ.Api.Controllers;

/// <summary>Candidate profile management and resume upload (FR-CD-01, FR-CD-02).</summary>
[ApiController]
[Authorize]
[Route("api/v1/candidates")]
[Produces("application/json")]
public class CandidateController : ControllerBase
{
    private readonly IMediator _mediator;

    public CandidateController(IMediator mediator) => _mediator = mediator;

    /// <summary>Create the current user's candidate profile.</summary>
    [HttpPost("profile")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateProfile([FromBody] CreateCandidateProfileRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var command = new CreateCandidateProfileCommand(
            userId == Guid.Empty ? request.UserId : userId,
            request.ProfessionalSummary,
            request.YearsOfExperience,
            request.Skills ?? Array.Empty<SkillAssignmentInput>());

        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetProfile), new { id = result.Id }, result);
    }

    /// <summary>View a candidate profile by id.</summary>
    [HttpGet("profile/{id:guid}")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Update a candidate profile.</summary>
    [HttpPut("profile/{id:guid}")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateCandidateProfileRequest request, CancellationToken ct)
    {
        var command = new UpdateCandidateProfileCommand(
            id,
            request.ProfessionalSummary,
            request.YearsOfExperience,
            request.Skills ?? Array.Empty<SkillAssignmentInput>());

        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Recruiter candidate search (FR-RC-02): filter candidates by skill and minimum experience.</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IReadOnlyList<CandidateProfileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? skill,
        [FromQuery] Guid? skillId,
        [FromQuery] decimal? minExperience,
        CancellationToken ct)
        => Ok(await _mediator.Send(new SearchCandidatesQuery(skill, skillId, minExperience), ct));

    /// <summary>AI job recommendations (FR-CD-06): jobs ranked by skill overlap with this profile.</summary>
    [HttpGet("{id:guid}/recommended-jobs")]
    [ProducesResponseType(typeof(IReadOnlyList<JobRecommendationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecommendedJobs(Guid id, CancellationToken ct)
    {
        var profile = await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct);
        var skillIds = profile.Skills.Select(s => s.SkillId).ToList();
        var recommendations = await _mediator.Send(new GetRecommendedJobsQuery(skillIds), ct);
        return Ok(recommendations);
    }

    /// <summary>Upload a resume (PDF/DOCX, max 5 MB) to Blob Storage; only the URL is persisted.</summary>
    [HttpPost("resume")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadResume([FromForm] Guid candidateProfileId, IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { title = "A resume file is required." });
        }

        await using var stream = file.OpenReadStream();
        var upload = new ResumeUpload
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
            Content = stream
        };

        var result = await _mediator.Send(new UploadResumeCommand(candidateProfileId, upload), ct);
        return Ok(result);
    }
}

public record CreateCandidateProfileRequest(
    Guid UserId,
    string ProfessionalSummary,
    decimal YearsOfExperience,
    IReadOnlyList<SkillAssignmentInput>? Skills);

public record UpdateCandidateProfileRequest(
    string ProfessionalSummary,
    decimal YearsOfExperience,
    IReadOnlyList<SkillAssignmentInput>? Skills);
