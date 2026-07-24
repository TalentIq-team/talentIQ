using Candidate.Domain.Enums;

namespace Candidate.Domain.Entities;

public class CandidateDocument
{
    public Guid Id { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public CandidateDocumentType DocumentType { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string BlobUrl { get; private set; } = string.Empty;
    public DateTime UploadedAt { get; private set; }

    private CandidateDocument() { }

    public CandidateDocument(
        Guid candidateProfileId,
        CandidateDocumentType documentType,
        string fileName,
        string blobUrl)
    {
        Id = Guid.NewGuid();
        CandidateProfileId = candidateProfileId;
        DocumentType = documentType;
        FileName = fileName;
        BlobUrl = blobUrl;
        UploadedAt = DateTime.UtcNow;
    }
}
