using Analytics.Domain.Enums;

namespace Analytics.Domain.Entities;

public class TalentPoolEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CandidateProfileId { get; set; }
    public Guid AddedByRecruiterId { get; set; }

    public ConsentStatus ConsentStatus { get; set; } = ConsentStatus.Pending;

    public string SkillTags { get; set; } = string.Empty;
    public string ProfileSnapshotJson { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConsentRespondedAt { get; set; }
    public DateTime? ConsentExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
}