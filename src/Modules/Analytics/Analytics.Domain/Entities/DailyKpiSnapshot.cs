namespace Analytics.Domain.Entities;

public class DailyKpiSnapshot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public DateTime SnapshotDate { get; set; } = DateTime.UtcNow;

    public int TotalApplications { get; set; }
    public int ShortlistedCount { get; set; }
    public int InterviewsScheduled { get; set; }
    public int OffersAccepted { get; set; }

    public decimal AverageTimeToHireDays { get; set; }
}