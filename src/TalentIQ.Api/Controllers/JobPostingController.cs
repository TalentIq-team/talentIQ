using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Applications.Queries.GetApplicationsByJobPosting;
using Recruitment.Application.JobPostings.Commands.CloseJobPosting;
using Recruitment.Application.JobPostings.Commands.CreateJobPosting;
using Recruitment.Application.JobPostings.Commands.PublishJobPosting;
using Recruitment.Application.JobPostings.Commands.UpdateJobPosting;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Application.JobPostings.Queries.SearchJobPostings;
using Recruitment.Domain.Entities;
using TalentIQ.Api.Extensions;

namespace TalentIQ.Api.Controllers;

/// <summary>Recruiter job-posting management and candidate job search (FR-CD-03).</summary>
[ApiController]
[Authorize]
[Route("api/v1/jobs")]
[Produces("application/json")]
public class JobPostingController : ControllerBase
{
    private readonly IMediator _mediator;

    public JobPostingController(IMediator mediator) => _mediator = mediator;

    /// <summary>Search open (published) job postings (FR-CD-03). Filter by title, skill, location, employment type.</summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<JobPostingDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? title,
        [FromQuery] Guid? skillId,
        [FromQuery] string? location,
        [FromQuery] EmploymentType? employmentType,
        CancellationToken ct)
    {
        var result = await _mediator.Send(new SearchJobPostingsQuery(title, skillId, location, employmentType), ct);
        return Ok(result);
    }

    /// <summary>Create a job posting (starts in Draft).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest request, CancellationToken ct)
    {
        var recruiterId = User.GetUserId();
        var command = new CreateJobPostingCommand(
            request.OrganizationId,
            recruiterId == Guid.Empty ? request.RecruiterId : recruiterId,
            request.Title,
            request.Description ?? string.Empty,
            request.Location ?? string.Empty,
            request.EmploymentType,
            request.MinExperienceYears,
            request.SkillIds ?? Array.Empty<Guid>());

        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Search), new { }, result);
    }

    /// <summary>Edit a job posting.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateJobRequest request, CancellationToken ct)
    {
        var command = new UpdateJobPostingCommand(
            id,
            request.Title,
            request.Description ?? string.Empty,
            request.Location ?? string.Empty,
            request.EmploymentType,
            request.MinExperienceYears,
            request.SkillIds ?? Array.Empty<Guid>());

        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Publish a job posting.</summary>
    [HttpPost("{id:guid}/publish")]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new PublishJobPostingCommand(id), ct));

    /// <summary>Close a job posting.</summary>
    [HttpPost("{id:guid}/close")]
    [ProducesResponseType(typeof(JobPostingDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Close(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new CloseJobPostingCommand(id), ct));

    /// <summary>Recruiter candidate pipeline: all applications for a job posting.</summary>
    [HttpGet("{id:guid}/applications")]
    [ProducesResponseType(typeof(IReadOnlyList<ApplicationDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Pipeline(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetApplicationsByJobPostingQuery(id), ct));
}

public record CreateJobRequest(
    Guid OrganizationId,
    Guid RecruiterId,
    string Title,
    string? Description,
    string? Location,
    EmploymentType EmploymentType,
    int MinExperienceYears,
    IReadOnlyList<Guid>? SkillIds);

public record UpdateJobRequest(
    string Title,
    string? Description,
    string? Location,
    EmploymentType EmploymentType,
    int MinExperienceYears,
    IReadOnlyList<Guid>? SkillIds);
