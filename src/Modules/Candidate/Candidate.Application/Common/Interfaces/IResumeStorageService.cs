using Candidate.Application.Common.Models;

namespace Candidate.Application.Common.Interfaces;

/// <summary>
/// Abstraction over resume file storage (Azure Blob Storage in production, Azurite locally).
/// Implemented by BlobResumeStorageService in Candidate.Infrastructure (FR-CD-02).
/// </summary>
public interface IResumeStorageService
{
    /// <summary>Uploads the resume and returns the stored blob URL.</summary>
    Task<string> UploadResumeAsync(Guid candidateProfileId, ResumeUpload upload, CancellationToken cancellationToken = default);
}
