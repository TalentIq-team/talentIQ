using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recruitment.Application.Messages.Commands.SendMessage;
using Recruitment.Application.Messages.Dtos;
using Recruitment.Application.Messages.Queries.GetMessagesByApplication;
using TalentIQ.Api.Extensions;

namespace TalentIQ.Api.Controllers;

/// <summary>Application messaging between recruiter and applicant (FR-RC-04).</summary>
[ApiController]
[Authorize]
[Route("api/v1/messages")]
[Produces("application/json")]
public class MessageController : ControllerBase
{
    private readonly IMediator _mediator;

    public MessageController(IMediator mediator) => _mediator = mediator;

    /// <summary>Send a message against an application. Sender is taken from the JWT.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(MessageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Send([FromBody] SendMessageRequest request, CancellationToken ct)
    {
        var senderId = User.GetUserId();
        var result = await _mediator.Send(
            new SendMessageCommand(request.ApplicationId, senderId == Guid.Empty ? request.SenderUserId : senderId, request.Body), ct);

        return CreatedAtAction(nameof(GetByApplication), new { applicationId = result.ApplicationId }, result);
    }

    /// <summary>View the message history for an application.</summary>
    [HttpGet("application/{applicationId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<MessageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByApplication(Guid applicationId, CancellationToken ct)
        => Ok(await _mediator.Send(new GetMessagesByApplicationQuery(applicationId), ct));
}

public record SendMessageRequest(Guid ApplicationId, Guid SenderUserId, string Body);
