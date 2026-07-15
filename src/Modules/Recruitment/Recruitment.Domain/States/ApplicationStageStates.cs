using Recruitment.Domain.Entities;

namespace Recruitment.Domain.States;

/// <summary>Applied → Screening (or Rejected).</summary>
public sealed class AppliedState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.Applied;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        new[] { ApplicationStage.Screening, ApplicationStage.Rejected };
}

/// <summary>Screening → Shortlisted (or Rejected).</summary>
public sealed class ScreeningState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.Screening;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        new[] { ApplicationStage.Shortlisted, ApplicationStage.Rejected };
}

/// <summary>Shortlisted → InterviewScheduled (or Rejected).</summary>
public sealed class ShortlistedState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.Shortlisted;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        new[] { ApplicationStage.InterviewScheduled, ApplicationStage.Rejected };
}

/// <summary>InterviewScheduled → Interviewed (or Rejected).</summary>
public sealed class InterviewScheduledState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.InterviewScheduled;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        new[] { ApplicationStage.Interviewed, ApplicationStage.Rejected };
}

/// <summary>Interviewed → Offered (or Rejected).</summary>
public sealed class InterviewedState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.Interviewed;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        new[] { ApplicationStage.Offered, ApplicationStage.Rejected };
}

/// <summary>Offered → Hired (or Rejected).</summary>
public sealed class OfferedState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.Offered;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        new[] { ApplicationStage.Hired, ApplicationStage.Rejected };
}

/// <summary>Hired is a terminal state — no further transitions.</summary>
public sealed class HiredState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.Hired;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        Array.Empty<ApplicationStage>();
}

/// <summary>Rejected is a terminal state — no further transitions.</summary>
public sealed class RejectedState : ApplicationStageStateBase
{
    public override ApplicationStage Stage => ApplicationStage.Rejected;
    public override IReadOnlyCollection<ApplicationStage> AllowedTransitions { get; } =
        Array.Empty<ApplicationStage>();
}
