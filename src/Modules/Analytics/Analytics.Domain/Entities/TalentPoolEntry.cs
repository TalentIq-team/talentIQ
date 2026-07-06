namespace Analytics.Domain.Entities;

public class TalentPoolEntry
{
    public Guid Id { get; set; }
    public Guid CandidateProfileId { get; set; }
    public Guid AddedByRecruiterId { get; set; }
    public ConsentStatus ConsentStatus { get; set; }
    public string ProfileSnapshotJson { get; set; } = string.Empty;
    public DateTime? ConsentExpiryDate { get; set; }
}
