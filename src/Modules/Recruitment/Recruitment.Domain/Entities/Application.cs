namespace Recruitment.Domain.Entities;

public class Application
{
    public Guid Id { get; set; }
    public Guid JobPostingId { get; set; }
    public Guid CandidateProfileId { get; set; }
    public ApplicationStage Stage { get; set; }
    public decimal? AiMatchScore { get; set; }
    public DateTime AppliedAt { get; set; }
}
