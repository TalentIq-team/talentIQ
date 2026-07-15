using Recruitment.Domain.Exceptions;
using Recruitment.Domain.States;

namespace Recruitment.Domain.Entities;

/// <summary>
/// Aggregate root representing a candidate's application to a job posting (FR-CD-04).
/// Stage transitions are validated through the State pattern and every transition
/// produces an <see cref="ApplicationStageHistory"/> record (FR-CD-05).
/// </summary>
public class Application
{
    private readonly List<ApplicationStageHistory> _stageHistory = new();

    public Guid Id { get; private set; }
    public Guid JobPostingId { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public ApplicationStage Stage { get; private set; }

    /// <summary>Populated later by the AI module (Member owning AI). Nullable at submission time.</summary>
    public decimal? AiMatchScore { get; private set; }

    public DateTime AppliedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public IReadOnlyCollection<ApplicationStageHistory> StageHistory => _stageHistory.AsReadOnly();

    /// <summary>An application is active while it has not reached a terminal stage.</summary>
    public bool IsActive => !ApplicationStageStateFactory.For(Stage).IsTerminal;

    // Required by EF Core.
    private Application()
    {
    }

    public static Application Submit(Guid jobPostingId, Guid candidateProfileId)
    {
        if (jobPostingId == Guid.Empty)
        {
            throw new RecruitmentDomainException("An application must reference a job posting.");
        }

        if (candidateProfileId == Guid.Empty)
        {
            throw new RecruitmentDomainException("An application must reference a candidate profile.");
        }

        return new Application
        {
            Id = Guid.NewGuid(),
            JobPostingId = jobPostingId,
            CandidateProfileId = candidateProfileId,
            Stage = ApplicationStage.Applied,
            AppliedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Advances (or rejects) the application to <paramref name="targetStage"/>.
    /// The current <see cref="IApplicationStageState"/> decides whether the transition is legal;
    /// an illegal transition throws <see cref="InvalidStageTransitionException"/>.
    /// A history record is appended atomically with the stage change.
    /// </summary>
    public ApplicationStageHistory AdvanceTo(ApplicationStage targetStage, Guid? changedByUserId = null, string? note = null)
    {
        var currentState = ApplicationStageStateFactory.For(Stage);

        if (!currentState.CanTransitionTo(targetStage))
        {
            throw new InvalidStageTransitionException(Stage, targetStage);
        }

        var history = new ApplicationStageHistory(Id, Stage, targetStage, changedByUserId, note);
        _stageHistory.Add(history);

        Stage = targetStage;
        UpdatedAt = DateTime.UtcNow;

        return history;
    }

    public void SetAiMatchScore(decimal score)
    {
        AiMatchScore = score;
        UpdatedAt = DateTime.UtcNow;
    }
}
