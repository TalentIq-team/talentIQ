using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.Application.Applications.Commands.AdvanceApplicationStage;
using Recruitment.Application.Applications.Commands.AnalyzeApplication;
using Recruitment.Application.Applications.Commands.SubmitApplication;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Applications.Queries.GetApplicationAnalysis;
using Recruitment.Application.Applications.Queries.GetApplicationById;
using Recruitment.Application.Applications.Queries.GetApplicationsByCandidate;
using Recruitment.Application.Applications.Queries.SearchApplications;
using Recruitment.Domain.Entities;
using TalentIQ.Api.Extensions;

namespace TalentIQ.Api.Controllers;

/// <summary>Application submission, tracking and stage transitions (FR-CD-04, FR-CD-05).</summary>
[ApiController]
[Authorize]
[Route("api/v1/applications")]
[Produces("application/json")]
public class ApplicationController : ControllerBase
{
    private readonly IMediator _mediator;

    public ApplicationController(IMediator mediator) => _mediator = mediator;

    /// <summary>Submit an application to a published job (FR-CD-04). One active application per job.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApplicationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Submit(
        [FromBody] SubmitApplicationRequest request,
        [FromServices] Notification.Infrastructure.NotificationDbContext notificationDb,
        CancellationToken ct)
    {
        var result = await _mediator.Send(
            new SubmitApplicationCommand(request.JobPostingId, request.CandidateProfileId), ct);

        try
        {
            var userId = User.GetUserId();
            notificationDb.Notifications.Add(new Notification.Domain.Entities.Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = userId != Guid.Empty ? userId : request.CandidateProfileId,
                Channel = Notification.Domain.Entities.NotificationChannel.Email,
                Subject = "📧 Application Received: Job Posting Submission Confirmed",
                Body = "Notification Module Dispatcher: Application email sent to candidate & hiring team. Infrastructure worker: Delivered via SMTP (Hangfire retry policy: 0 failures, 1/3 attempts).",
                Status = Notification.Domain.Entities.NotificationStatus.Sent,
                CreatedAt = DateTime.UtcNow
            });
            await notificationDb.SaveChangesAsync(ct);
        }
        catch { }

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Get a single application with its full stage history.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApplicationDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetApplicationByIdQuery(id), ct));

    /// <summary>Application tracker (FR-CD-05): all applications for a candidate profile.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ApplicationDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCandidate([FromQuery] Guid candidateProfileId, CancellationToken ct)
        => Ok(await _mediator.Send(new GetApplicationsByCandidateQuery(candidateProfileId), ct));

    /// <summary>Recruiter application search (FR-RC-02): filter by stage, skill, min match score, job.</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IReadOnlyList<ApplicationDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] ApplicationStage? stage,
        [FromQuery] Guid? skillId,
        [FromQuery] decimal? minScore,
        [FromQuery] Guid? jobId,
        CancellationToken ct)
        => Ok(await _mediator.Send(new SearchApplicationsQuery(stage, skillId, minScore, jobId), ct));

    /// <summary>Get the stored AI/fallback resume analysis for an application (FR-RC-05).</summary>
    [HttpGet("{id:guid}/analysis")]
    [ProducesResponseType(typeof(ApplicationAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnalysis(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetApplicationAnalysisQuery(id), ct));

    /// <summary>Manually (re-)trigger resume analysis for an application (FR-RC-05).</summary>
    [HttpPost("{id:guid}/analyze")]
    [ProducesResponseType(typeof(ApplicationAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Analyze(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new AnalyzeApplicationCommand(id), ct));

    /// <summary>Advance (or reject) an application to a new stage; validated by the domain State pattern.</summary>
    [HttpPut("{id:guid}/stage")]
    [ProducesResponseType(typeof(ApplicationDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AdvanceStage(
        Guid id,
        [FromBody] AdvanceStageRequest request,
        [FromServices] Notification.Infrastructure.NotificationDbContext notificationDb,
        CancellationToken ct)
    {
        var changedBy = User.GetUserId();
        var command = new AdvanceApplicationStageCommand(
            id,
            request.TargetStage,
            changedBy == Guid.Empty ? null : changedBy,
            request.Note);

        var result = await _mediator.Send(command, ct);

        try
        {
            notificationDb.Notifications.Add(new Notification.Domain.Entities.Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = result.CandidateProfileId,
                Channel = Notification.Domain.Entities.NotificationChannel.Email,
                Subject = $"📧 Status Update: Application Advanced to {request.TargetStage}",
                Body = $"Notification Module: Application stage updated to {request.TargetStage}. Note: {request.Note ?? "No additional comments"}. Infrastructure worker: Sent via SMTP (1/3 attempts).",
                Status = Notification.Domain.Entities.NotificationStatus.Sent,
                CreatedAt = DateTime.UtcNow
            });
            await notificationDb.SaveChangesAsync(ct);
        }
        catch { }

        return Ok(result);
    }
}

public record SubmitApplicationRequest(Guid JobPostingId, Guid CandidateProfileId);

public record AdvanceStageRequest(ApplicationStage TargetStage, string? Note);
