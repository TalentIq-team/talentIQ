namespace Candidate.Domain.Entities;

public class CandidateAchievement
{
    public Guid Id { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string IssuedBy { get; private set; } = string.Empty;
    public DateTime AwardDate { get; private set; }

    public CandidateProfile? CandidateProfile { get; private set; }

    private CandidateAchievement() { }

    public CandidateAchievement(
        Guid candidateProfileId,
        string title,
        string description,
        string issuedBy,
        DateTime awardDate)
    {
        Id = Guid.NewGuid();
        CandidateProfileId = candidateProfileId;
        Update(title, description, issuedBy, awardDate);
    }

    public void Update(
        string title,
        string description,
        string issuedBy,
        DateTime awardDate)
    {
        Title = title.Trim();
        Description = description.Trim();
        IssuedBy = issuedBy.Trim();
        AwardDate = awardDate;
    }
}
