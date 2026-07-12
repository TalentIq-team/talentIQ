namespace Candidate.Application.Common.Models;

/// <summary>
/// Transport model for an uploaded resume file passed from the API layer into the
/// application layer (FR-CD-02). Holds the raw content plus metadata used for validation.
/// </summary>
public class ResumeUpload
{
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public required long Length { get; init; }
    public required Stream Content { get; init; }
}
