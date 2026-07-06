namespace Interview.Domain.Entities;

public class CandidateEvaluation
{
    public Guid Id { get; set; }
    public Guid InterviewId { get; set; }
    public decimal TechnicalScore { get; set; }
    public decimal BehavioralScore { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}
