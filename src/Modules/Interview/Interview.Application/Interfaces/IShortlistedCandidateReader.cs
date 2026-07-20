using Interview.Application.DTOs;

namespace Interview.Application.Interfaces;

/// <summary>
/// Port for reading shortlisted candidates that live in another module's boundary.
/// Implemented at the API composition root so Interview and Recruitment stay decoupled —
/// neither project references the other.
/// </summary>
public interface IShortlistedCandidateReader
{
    Task<IReadOnlyList<ShortlistedCandidateDto>> GetShortlistedAsync(
        Guid? jobPostingId,
        CancellationToken cancellationToken = default);
}
