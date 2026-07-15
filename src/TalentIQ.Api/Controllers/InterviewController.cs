using Interview.Application.Commands.RescheduleInterview;
using Interview.Application.Commands.ScheduleInterview;
using Interview.Application.Commands.SubmitEvaluation;
using Microsoft.AspNetCore.Mvc;

namespace TalentIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InterviewController : ControllerBase
{
    private readonly ScheduleInterviewCommandHandler _handler;
    private readonly RescheduleInterviewCommandHandler _rescheduleHandler;
    private readonly SubmitEvaluationCommandHandler _evaluationHandler;

    public InterviewController(
        ScheduleInterviewCommandHandler handler,
        RescheduleInterviewCommandHandler rescheduleHandler,
        SubmitEvaluationCommandHandler evaluationHandler)
    {
        _handler = handler;
        _rescheduleHandler = rescheduleHandler;
        _evaluationHandler = evaluationHandler;
    }

    [HttpPost("schedule")]
    public async Task<IActionResult> ScheduleInterview(
        [FromBody] ScheduleInterviewCommand command)
    {
        await _handler.Handle(command);

        return Ok(new
        {
            Message = "Interview scheduled successfully."
        });
    }

    [HttpPut("reschedule")]
    public async Task<IActionResult> RescheduleInterview(
        [FromBody] RescheduleInterviewCommand command)
    {
        await _rescheduleHandler.Handle(command);

        return Ok(new
        {
            Message = "Interview rescheduled successfully."
        });
    }

    [HttpPost("evaluation")]
    public async Task<IActionResult> SubmitEvaluation(
        [FromBody] SubmitEvaluationCommand command)
    {
        await _evaluationHandler.Handle(command);

        return Ok(new
        {
            Message = "Candidate evaluation submitted successfully."
        });
    }
}