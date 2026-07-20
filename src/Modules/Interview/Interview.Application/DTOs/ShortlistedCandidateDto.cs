namespace Interview.Application.DTOs;

/// <summary>
/// A candidate shortlisted for interview. Deliberately built from primitives only so the Interview
/// module never depends on the Recruitment module's types — the mapping lives in the composition
/// root adapter (see <c>IShortlistedCandidateReader</c>).
/// </summary>
public record ShortlistedCandidateDto(
    Guid ApplicationId,
    Guid CandidateProfileId,
    Guid JobPostingId,
    decimal? AiMatchScore,
    DateTime AppliedAt,
    bool HasInterviewScheduled);
