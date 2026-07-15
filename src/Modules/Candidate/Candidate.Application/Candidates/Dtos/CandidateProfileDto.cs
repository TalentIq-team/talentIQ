using Candidate.Domain.Entities;

namespace Candidate.Application.Candidates.Dtos;

/// <summary>A skill on a candidate profile, with its self-declared proficiency level (FR-CD-01).</summary>
public record CandidateSkillDto(Guid SkillId, string? ProficiencyLevel)
{
    public static CandidateSkillDto FromEntity(CandidateSkill skill) =>
        new(skill.SkillId, skill.ProficiencyLevel);
}

public record CandidateProfileDto(
    Guid Id,
    Guid UserId,
    string ProfessionalSummary,
    string? ResumeBlobUrl,
    decimal YearsOfExperience,
    IReadOnlyList<CandidateSkillDto> Skills,
    DateTime CreatedAt,
    DateTime UpdatedAt)
{
    public static CandidateProfileDto FromEntity(CandidateProfile profile) => new(
        profile.Id,
        profile.UserId,
        profile.ProfessionalSummary,
        profile.ResumeBlobUrl,
        profile.YearsOfExperience,
        profile.Skills.Select(CandidateSkillDto.FromEntity).ToList(),
        profile.CreatedAt,
        profile.UpdatedAt);
}
