using Candidate.Application.Common;
using Candidate.Domain.Entities;
using FluentValidation;

namespace Candidate.Application.Common.Models;

/// <summary>
/// Inbound skill selection for a candidate profile (FR-CD-01): a skill plus its proficiency level.
/// </summary>
public record SkillAssignmentInput(Guid SkillId, string ProficiencyLevel)
{
    public SkillAssignment ToAssignment() => new(SkillId, ProficiencyLevel);
}

public class SkillAssignmentInputValidator : AbstractValidator<SkillAssignmentInput>
{
    public SkillAssignmentInputValidator()
    {
        RuleFor(x => x.SkillId).NotEmpty();
        RuleFor(x => x.ProficiencyLevel)
            .NotEmpty()
            .Must(ProficiencyLevels.IsValid)
            .WithMessage($"Proficiency level must be one of: {string.Join(", ", ProficiencyLevels.All)}.");
    }
}
