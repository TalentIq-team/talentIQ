namespace Candidate.Domain.Entities;

public class CandidateExperience
{
    public Guid Id { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public string Company { get; private set; } = string.Empty;
    public string JobTitle { get; private set; } = string.Empty;
    public string EmploymentType { get; private set; } = "Full-time";
    public string Location { get; private set; } = string.Empty;
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public bool CurrentlyWorking { get; private set; }
    public string Responsibilities { get; private set; } = string.Empty;
    public string Achievements { get; private set; } = string.Empty;
    public string TechnologiesUsed { get; private set; } = string.Empty;

    public CandidateProfile? CandidateProfile { get; private set; }

    private CandidateExperience() { }

    public CandidateExperience(
        Guid candidateProfileId,
        string company,
        string jobTitle,
        string employmentType,
        string location,
        DateTime startDate,
        DateTime? endDate,
        bool currentlyWorking,
        string responsibilities,
        string achievements,
        string technologiesUsed)
    {
        Id = Guid.NewGuid();
        CandidateProfileId = candidateProfileId;
        Update(company, jobTitle, employmentType, location, startDate, endDate, currentlyWorking, responsibilities, achievements, technologiesUsed);
    }

    public void Update(
        string company,
        string jobTitle,
        string employmentType,
        string location,
        DateTime startDate,
        DateTime? endDate,
        bool currentlyWorking,
        string responsibilities,
        string achievements,
        string technologiesUsed)
    {
        Company = company.Trim();
        JobTitle = jobTitle.Trim();
        EmploymentType = string.IsNullOrWhiteSpace(employmentType) ? "Full-time" : employmentType.Trim();
        Location = location.Trim();
        StartDate = startDate;
        CurrentlyWorking = currentlyWorking;
        EndDate = currentlyWorking ? null : endDate;
        Responsibilities = responsibilities.Trim();
        Achievements = achievements.Trim();
        TechnologiesUsed = technologiesUsed.Trim();
    }
}
