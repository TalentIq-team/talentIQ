namespace Recruitment.Domain.Entities;

/// <summary>
/// Stored result of an AI (or fallback) resume analysis for an application (FR-RC-05):
/// a match score plus the matched/missing skills and a human-readable explanation.
/// Skill id collections are persisted as CSV strings (see ApplicationAnalysisConfiguration).
/// </summary>
public class ApplicationAnalysis
{
    public Guid Id { get; private set; }
    public Guid ApplicationId { get; private set; }
    public decimal MatchScore { get; private set; }
    public string MatchedSkillIdsCsv { get; private set; } = string.Empty;
    public string MissingSkillIdsCsv { get; private set; } = string.Empty;
    public string Explanation { get; private set; } = string.Empty;
    public DateTime AnalyzedAt { get; private set; }

    // Required by EF Core.
    private ApplicationAnalysis()
    {
    }

    public static ApplicationAnalysis Create(
        Guid applicationId,
        decimal matchScore,
        IEnumerable<Guid> matchedSkillIds,
        IEnumerable<Guid> missingSkillIds,
        string explanation)
    {
        return new ApplicationAnalysis
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            MatchScore = matchScore,
            MatchedSkillIdsCsv = string.Join(',', matchedSkillIds),
            MissingSkillIdsCsv = string.Join(',', missingSkillIds),
            Explanation = explanation,
            AnalyzedAt = DateTime.UtcNow
        };
    }

    public void Update(decimal matchScore, IEnumerable<Guid> matchedSkillIds, IEnumerable<Guid> missingSkillIds, string explanation)
    {
        MatchScore = matchScore;
        MatchedSkillIdsCsv = string.Join(',', matchedSkillIds);
        MissingSkillIdsCsv = string.Join(',', missingSkillIds);
        Explanation = explanation;
        AnalyzedAt = DateTime.UtcNow;
    }

    public IReadOnlyList<Guid> MatchedSkillIds => Parse(MatchedSkillIdsCsv);
    public IReadOnlyList<Guid> MissingSkillIds => Parse(MissingSkillIdsCsv);

    private static IReadOnlyList<Guid> Parse(string csv) =>
        string.IsNullOrWhiteSpace(csv)
            ? Array.Empty<Guid>()
            : csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                 .Select(Guid.Parse)
                 .ToList();
}
