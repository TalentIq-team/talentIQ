namespace Candidate.Domain.Exceptions;

/// <summary>
/// Raised when the resume file store (Azure Blob / Azurite) is unavailable or the upload fails
/// (FR-CD-02). Mapped to HTTP 503 by the API middleware so callers get a clear, actionable error
/// instead of an opaque 500.
/// </summary>
public class ResumeStorageException : Exception
{
    public ResumeStorageException(string message, Exception? innerException = null)
        : base(message, innerException)
    {
    }
}
