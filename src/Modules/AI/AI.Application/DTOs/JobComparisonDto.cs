namespace AI.Application.DTOs;

public record CompareJobRequest(
    string JobTitle,
    string JobDescription,
    List<string>? JobRequiredSkills,
    int MinExperienceYears,
    string CandidateSummary,
    List<string>? CandidateSkills,
    decimal CandidateYearsOfExperience,
    string? CandidateResumeText
);

public class JobComparisonResult
{
    public decimal OverallMatchScore { get; set; }
    public List<string> MatchedSkills { get; set; } = [];
    public List<string> MissingSkills { get; set; } = [];
    public List<string> KeyStrengths { get; set; } = [];
    public List<string> GrowthAreas { get; set; } = [];
    public List<string> Recommendations { get; set; } = [];
    public string ExecutiveSummary { get; set; } = string.Empty;
    public bool IsFallbackExecution { get; set; }
}
