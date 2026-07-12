using MediatR;
using Microsoft.Extensions.Logging;
using Recruitment.Application.Applications.Commands.AnalyzeApplication;
using Recruitment.Application.Applications.Events;

namespace Recruitment.Application.Applications.EventHandlers;

/// <summary>
/// FR-RC-05: after an application is submitted, automatically run resume analysis.
/// This runs in-process off the <see cref="ApplicationSubmittedEvent"/>. It is deliberately
/// resilient — any analysis failure is logged and swallowed so it NEVER breaks or blocks the
/// (already-committed) application submission.
/// </summary>
public class AnalyzeResumeOnApplicationSubmittedHandler : INotificationHandler<ApplicationSubmittedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<AnalyzeResumeOnApplicationSubmittedHandler> _logger;

    public AnalyzeResumeOnApplicationSubmittedHandler(
        IMediator mediator,
        ILogger<AnalyzeResumeOnApplicationSubmittedHandler> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Handle(ApplicationSubmittedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            await _mediator.Send(new AnalyzeApplicationCommand(notification.ApplicationId), cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Resume analysis failed for application {ApplicationId}; submission is unaffected.",
                notification.ApplicationId);
        }
    }
}
