using Interview.Application.Commands.CancelInterview;
using Interview.Application.Commands.RescheduleInterview;
using Interview.Application.Commands.ScheduleInterview;
using Interview.Application.Commands.SubmitEvaluation;
using Interview.Application.DTOs;
using Interview.Application.Queries.GetAllInterviews;
using Interview.Application.Queries.GetInterviewById;
using Interview.Application.Queries.GetShortlistedCandidates;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TalentIQ.Api.Controllers;

/// <summary>Interview scheduling, cancellation and candidate evaluation.</summary>
[ApiController]
[Authorize(Roles = "Recruiter,HiringManager")]
[Route("api/[controller]")]
[Produces("application/json")]
public class InterviewController : ControllerBase
{
    private readonly IMediator _mediator;

    public InterviewController(IMediator mediator) => _mediator = mediator;

    /// <summary>All interviews, earliest first.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<InterviewSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInterviews(CancellationToken ct)
    {
        var interviews = await _mediator.Send(new GetAllInterviewsQuery(), ct);
        return Ok(interviews);
    }

    /// <summary>Hiring-manager shortlist view: candidates shortlisted and awaiting interview.</summary>
    [HttpGet("shortlist")]
    [ProducesResponseType(typeof(IReadOnlyList<ShortlistedCandidateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShortlist([FromQuery] Guid? jobPostingId, CancellationToken ct)
    {
        var shortlisted = await _mediator.Send(new GetShortlistedCandidatesQuery(jobPostingId), ct);
        return Ok(shortlisted);
    }

    /// <summary>Interview detail for the evaluation page, including the evaluation if submitted.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(InterviewDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInterviewById(Guid id, CancellationToken ct)
    {
        var interview = await _mediator.Send(new GetInterviewByIdQuery(id), ct);
        return Ok(interview);
    }

    [HttpPost("schedule")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ScheduleInterview(
        [FromBody] ScheduleInterviewCommand command,
        CancellationToken ct)
    {
        var interviewId = await _mediator.Send(command, ct);

        return Ok(new
        {
            InterviewId = interviewId,
            Message = "Interview scheduled successfully."
        });
    }

    [HttpPut("reschedule")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RescheduleInterview(
        [FromBody] RescheduleInterviewCommand command,
        CancellationToken ct)
    {
        await _mediator.Send(command, ct);

        return Ok(new
        {
            Message = "Interview rescheduled successfully."
        });
    }

    /// <summary>
    /// Cancels an interview. This is a soft cancel — the record is retained with
    /// status <c>Cancelled</c> and the reason stored; no row is deleted.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelInterview(
        Guid id,
        [FromQuery] string? reason,
        CancellationToken ct)
    {
        await _mediator.Send(
            new CancelInterviewCommand { InterviewId = id, CancellationReason = reason },
            ct);

        return Ok(new
        {
            Message = "Interview cancelled successfully."
        });
    }

    [HttpPost("evaluation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SubmitEvaluation(
        [FromBody] SubmitEvaluationCommand command,
        CancellationToken ct)
    {
        var evaluationId = await _mediator.Send(command, ct);

        return Ok(new
        {
            EvaluationId = evaluationId,
            Message = "Candidate evaluation submitted successfully."
        });
    }
}
