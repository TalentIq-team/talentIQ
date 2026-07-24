using Recruitment.Domain.Entities;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace Recruitment.Application.Applications.Dtos;

public record ApplicationStageHistoryDto(
    ApplicationStage FromStage,
    ApplicationStage ToStage,
    DateTime ChangedAt,
    Guid? ChangedByUserId,
    string? Note)
{
    public static ApplicationStageHistoryDto FromEntity(ApplicationStageHistory h) =>
        new(h.FromStage, h.ToStage, h.ChangedAt, h.ChangedByUserId, h.Note);
}

public record ApplicationDto(
    Guid Id,
    Guid JobPostingId,
    Guid CandidateProfileId,
    ApplicationStage Stage,
    decimal? AiMatchScore,
    DateTime AppliedAt,
    DateTime UpdatedAt,
    string? JobTitle = null)
{
    public static ApplicationDto FromEntity(ApplicationEntity a) =>
        new(a.Id, a.JobPostingId, a.CandidateProfileId, a.Stage, a.AiMatchScore, a.AppliedAt, a.UpdatedAt);
}

/// <summary>Application with its full stage history (FR-CD-05 tracker).</summary>
public record ApplicationDetailDto(
    Guid Id,
    Guid JobPostingId,
    Guid CandidateProfileId,
    ApplicationStage Stage,
    decimal? AiMatchScore,
    DateTime AppliedAt,
    DateTime UpdatedAt,
    IReadOnlyList<ApplicationStageHistoryDto> StageHistory,
    string? JobTitle = null)
{
    public static ApplicationDetailDto FromEntity(ApplicationEntity a) => new(
        a.Id,
        a.JobPostingId,
        a.CandidateProfileId,
        a.Stage,
        a.AiMatchScore,
        a.AppliedAt,
        a.UpdatedAt,
        a.StageHistory
            .OrderBy(h => h.ChangedAt)
            .Select(ApplicationStageHistoryDto.FromEntity)
            .ToList());

    public ApplicationDetailDto WithJobTitle(string? title) => this with { JobTitle = title };
}