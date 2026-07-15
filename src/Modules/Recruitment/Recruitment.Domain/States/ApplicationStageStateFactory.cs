using Recruitment.Domain.Entities;

namespace Recruitment.Domain.States;

/// <summary>Resolves the <see cref="IApplicationStageState"/> for a given stage.</summary>
public static class ApplicationStageStateFactory
{
    public static IApplicationStageState For(ApplicationStage stage) => stage switch
    {
        ApplicationStage.Applied => new AppliedState(),
        ApplicationStage.Screening => new ScreeningState(),
        ApplicationStage.Shortlisted => new ShortlistedState(),
        ApplicationStage.InterviewScheduled => new InterviewScheduledState(),
        ApplicationStage.Interviewed => new InterviewedState(),
        ApplicationStage.Offered => new OfferedState(),
        ApplicationStage.Hired => new HiredState(),
        ApplicationStage.Rejected => new RejectedState(),
        _ => throw new ArgumentOutOfRangeException(nameof(stage), stage, "Unknown application stage.")
    };
}
