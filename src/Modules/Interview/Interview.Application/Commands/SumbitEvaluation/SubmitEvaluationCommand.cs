namespace Interview.Application.Commands.SubmitEvaluation;

public class SubmitEvaluationCommand
{
    public Guid InterviewId { get; set; }

    public decimal TechnicalScore { get; set; }

    public decimal BehavioralScore { get; set; }

    public string Recommendation { get; set; } = string.Empty;
}