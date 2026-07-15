namespace AI.Application.DTOs;

public class ResumeAnalysisResult
{
    public decimal OverallMatchScore { get; set; }
    public List<string> MatchedSkills { get; set; } = [];
    public List<string> MissingSkills { get; set; } = [];
    public string Summary { get; set; } = string.Empty;
    public bool IsFallbackExecution { get; set; }
}
