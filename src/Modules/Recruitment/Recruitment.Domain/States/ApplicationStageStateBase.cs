using Recruitment.Domain.Entities;

namespace Recruitment.Domain.States;

/// <summary>Base state that resolves transitions from a declared allow-list.</summary>
public abstract class ApplicationStageStateBase : IApplicationStageState
{
    public abstract ApplicationStage Stage { get; }

    public abstract IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; }

    public bool IsTerminal => AllowedTransitions.Count == 0;

    public bool CanTransitionTo(ApplicationStage target) => AllowedTransitions.Contains(target);
}
