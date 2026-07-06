namespace Candidate.Domain.Entities;

public class CandidateProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ProfessionalSummary { get; set; } = string.Empty;
    public string? ResumeBlobUrl { get; set; }
    public decimal YearsOfExperience { get; set; }
}
