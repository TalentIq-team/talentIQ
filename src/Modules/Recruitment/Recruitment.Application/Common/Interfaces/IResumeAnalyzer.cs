namespace Recruitment.Application.Common.Interfaces;

/// <summary>
/// Result of analysing a candidate's fit for a job (FR-RC-05): a match score plus the matched and
/// missing skill ids and a short explanation.
/// </summary>
public record ResumeAnalysisResult(
    decimal MatchScore,
    IReadOnlyList<Guid> MatchedSkillIds,
    IReadOnlyList<Guid> MissingSkillIds,
    string Explanation);

/// <summary>
/// Analyses how well a candidate matches a job posting (FR-RC-05). The production implementation may
/// call an external AI service (e.g. Gemini); the shipped implementation is a deterministic skill-overlap
/// fallback so the feature works without the AI module being present.
/// </summary>
public interface IResumeAnalyzer
{
    Task<ResumeAnalysisResult> AnalyzeAsync(Guid jobPostingId, Guid candidateProfileId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Reads a candidate's declared skill ids from the Candidate module. Implemented in the API
/// composition root (which can reference the Candidate module) so this module stays decoupled.
/// </summary>
public interface ICandidateSkillReader
{
    Task<IReadOnlyList<Guid>> GetSkillIdsAsync(Guid candidateProfileId, CancellationToken cancellationToken = default);
}
