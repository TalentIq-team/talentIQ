using Recruitment.Domain.Entities;

namespace Recruitment.Application.Applications.Dtos;

/// <summary>Stored resume-analysis result for an application (FR-RC-05).</summary>
public record ApplicationAnalysisDto(
    Guid ApplicationId,
    decimal MatchScore,
    IReadOnlyList<Guid> MatchedSkillIds,
    IReadOnlyList<Guid> MissingSkillIds,
    string Explanation,
    DateTime AnalyzedAt)
{
    public static ApplicationAnalysisDto FromEntity(ApplicationAnalysis a) => new(
        a.ApplicationId,
        a.MatchScore,
        a.MatchedSkillIds,
        a.MissingSkillIds,
        a.Explanation,
        a.AnalyzedAt);
}
