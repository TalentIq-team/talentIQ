using Recruitment.Domain.Entities;

namespace Recruitment.Domain.Exceptions;

/// <summary>
/// Raised when an application stage transition is not permitted by the State pattern rules.
/// </summary>
public class InvalidStageTransitionException : RecruitmentDomainException
{
    public ApplicationStage FromStage { get; }
    public ApplicationStage ToStage { get; }

    public InvalidStageTransitionException(ApplicationStage fromStage, ApplicationStage toStage)
        : base($"Cannot move application from '{fromStage}' to '{toStage}'. This transition is not allowed.")
    {
        FromStage = fromStage;
        ToStage = toStage;
    }
}
