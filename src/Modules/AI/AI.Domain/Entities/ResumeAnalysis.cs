namespace AI.Domain.Entities;

public class ResumeAnalysis
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public decimal OverallMatchScore { get; set; }
    public string MatchedSkillsJson { get; set; } = string.Empty;
    public string MissingSkillsJson { get; set; } = string.Empty;
    public bool IsFallbackExecution { get; set; }
}
