namespace Candidate.Domain.Entities;

/// <summary>
/// Value object describing a skill a candidate declares on their profile, together with an
/// optional self-declared proficiency level (FR-CD-01).
/// </summary>
public record SkillAssignment(Guid SkillId, string? ProficiencyLevel);
