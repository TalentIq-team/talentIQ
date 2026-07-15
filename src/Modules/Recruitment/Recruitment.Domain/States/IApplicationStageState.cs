using Recruitment.Domain.Entities;

namespace Recruitment.Domain.States;

/// <summary>
/// State pattern contract. Each concrete state knows which stages it may transition to,
/// keeping the transition rules inside the domain (not in application/service code).
/// </summary>
public interface IApplicationStageState
{
    ApplicationStage Stage { get; }

    /// <summary>True when no further transitions are possible (Hired / Rejected).</summary>
    bool IsTerminal { get; }

    IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; }

    bool CanTransitionTo(ApplicationStage target);
}
