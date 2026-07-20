using MediatR;

namespace Interview.Application.Commands.SubmitEvaluation;

public class SubmitEvaluationCommand : IRequest<Guid>
{
    public Guid InterviewId { get; set; }

    public decimal TechnicalScore { get; set; }

    public decimal BehavioralScore { get; set; }

    public decimal OverallScore { get; set; }

    public string Comments { get; set; } = string.Empty;

    public string Recommendation { get; set; } = string.Empty;
}
