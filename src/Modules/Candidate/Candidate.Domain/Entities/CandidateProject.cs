namespace Candidate.Domain.Entities;

public class CandidateProject
{
    public Guid Id { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public string ProjectName { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty;
    public string Technologies { get; private set; } = string.Empty;
    public string GitHubUrl { get; private set; } = string.Empty;
    public string LiveDemoUrl { get; private set; } = string.Empty;
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }

    public CandidateProfile? CandidateProfile { get; private set; }

    private CandidateProject() { }

    public CandidateProject(
        Guid candidateProfileId,
        string projectName,
        string description,
        string role,
        string technologies,
        string gitHubUrl,
        string liveDemoUrl,
        DateTime? startDate,
        DateTime? endDate)
    {
        Id = Guid.NewGuid();
        CandidateProfileId = candidateProfileId;
        Update(projectName, description, role, technologies, gitHubUrl, liveDemoUrl, startDate, endDate);
    }

    public void Update(
        string projectName,
        string description,
        string role,
        string technologies,
        string gitHubUrl,
        string liveDemoUrl,
        DateTime? startDate,
        DateTime? endDate)
    {
        ProjectName = projectName.Trim();
        Description = description.Trim();
        Role = role.Trim();
        Technologies = technologies.Trim();
        GitHubUrl = gitHubUrl.Trim();
        LiveDemoUrl = liveDemoUrl.Trim();
        StartDate = startDate;
        EndDate = endDate;
    }
}
