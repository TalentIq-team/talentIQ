namespace Candidate.Domain.Entities;

public class CandidateCertification
{
    public Guid Id { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Organization { get; private set; } = string.Empty;
    public DateTime IssueDate { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    public string CredentialId { get; private set; } = string.Empty;
    public string CredentialUrl { get; private set; } = string.Empty;

    public CandidateProfile? CandidateProfile { get; private set; }

    private CandidateCertification() { }

    public CandidateCertification(
        Guid candidateProfileId,
        string name,
        string organization,
        DateTime issueDate,
        DateTime? expiryDate,
        string credentialId,
        string credentialUrl)
    {
        Id = Guid.NewGuid();
        CandidateProfileId = candidateProfileId;
        Update(name, organization, issueDate, expiryDate, credentialId, credentialUrl);
    }

    public void Update(
        string name,
        string organization,
        DateTime issueDate,
        DateTime? expiryDate,
        string credentialId,
        string credentialUrl)
    {
        Name = name.Trim();
        Organization = organization.Trim();
        IssueDate = issueDate;
        ExpiryDate = expiryDate;
        CredentialId = credentialId.Trim();
        CredentialUrl = credentialUrl.Trim();
    }
}
