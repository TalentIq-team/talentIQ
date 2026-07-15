namespace Recruitment.Domain.Entities;

/// <summary>
/// Immutable audit record of a single application stage transition (FR-CD-05).
/// </summary>
public class ApplicationStageHistory
{
    public Guid Id { get; private set; }
    public Guid ApplicationId { get; private set; }
    public ApplicationStage FromStage { get; private set; }
    public ApplicationStage ToStage { get; private set; }
    public DateTime ChangedAt { get; private set; }

    /// <summary>Identity user who performed the transition (recruiter). Optional.</summary>
    public Guid? ChangedByUserId { get; private set; }

    public string? Note { get; private set; }

    // Required by EF Core.
    private ApplicationStageHistory()
    {
    }

    internal ApplicationStageHistory(
        Guid applicationId,
        ApplicationStage fromStage,
        ApplicationStage toStage,
        Guid? changedByUserId,
        string? note)
    {
        Id = Guid.NewGuid();
        ApplicationId = applicationId;
        FromStage = fromStage;
        ToStage = toStage;
        ChangedAt = DateTime.UtcNow;
        ChangedByUserId = changedByUserId;
        Note = note;
    }
}
