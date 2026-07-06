namespace Analytics.Domain.Entities;

public class DailyKpiSnapshot
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public DateOnly SnapshotDate { get; set; }
    public int TotalApplications { get; set; }
    public decimal AvgTimeToHireDays { get; set; }
}
