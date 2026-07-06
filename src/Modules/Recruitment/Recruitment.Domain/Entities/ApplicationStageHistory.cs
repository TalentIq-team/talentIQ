namespace Recruitment.Domain.Entities;

public class ApplicationStageHistory
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public ApplicationStage FromStage { get; set; }
    public ApplicationStage ToStage { get; set; }
    public DateTime ChangedAt { get; set; }
}
