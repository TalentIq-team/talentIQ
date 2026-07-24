namespace Candidate.Domain.Entities;

public class CandidateEducation
{
    public Guid Id { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public string Institution { get; private set; } = string.Empty;
    public string Degree { get; private set; } = string.Empty;
    public string FieldOfStudy { get; private set; } = string.Empty;
    public string GPA { get; private set; } = string.Empty;
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public string Description { get; private set; } = string.Empty;

    public CandidateProfile? CandidateProfile { get; private set; }

    private CandidateEducation() { }

    public CandidateEducation(
        Guid candidateProfileId,
        string institution,
        string degree,
        string fieldOfStudy,
        string gpa,
        DateTime startDate,
        DateTime? endDate,
        string description)
    {
        Id = Guid.NewGuid();
        CandidateProfileId = candidateProfileId;
        Update(institution, degree, fieldOfStudy, gpa, startDate, endDate, description);
    }

    public void Update(
        string institution,
        string degree,
        string fieldOfStudy,
        string gpa,
        DateTime startDate,
        DateTime? endDate,
        string description)
    {
        Institution = institution.Trim();
        Degree = degree.Trim();
        FieldOfStudy = fieldOfStudy.Trim();
        GPA = gpa.Trim();
        StartDate = startDate;
        EndDate = endDate;
        Description = description.Trim();
    }
}
