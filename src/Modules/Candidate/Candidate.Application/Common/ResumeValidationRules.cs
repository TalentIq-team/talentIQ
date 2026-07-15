namespace Candidate.Application.Common;

/// <summary>
/// Central resume-upload rules (FR-CD-02): PDF/DOCX only, maximum 5 MB.
/// Shared by the FluentValidation validator and unit tests.
/// </summary>
public static class ResumeValidationRules
{
    public const long MaxSizeBytes = 5 * 1024 * 1024; // 5 MB

    public static readonly IReadOnlyCollection<string> AllowedContentTypes = new[]
    {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    public static readonly IReadOnlyCollection<string> AllowedExtensions = new[]
    {
        ".pdf",
        ".docx"
    };

    public static bool IsAllowedContentType(string? contentType) =>
        !string.IsNullOrWhiteSpace(contentType) &&
        AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase);

    public static bool IsAllowedExtension(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return false;
        }

        var extension = Path.GetExtension(fileName);
        return AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase);
    }

    public static bool IsAllowedSize(long length) => length > 0 && length <= MaxSizeBytes;

    /// <summary>Convenience check used by tests: file is valid on all three rules.</summary>
    public static bool IsValid(string? fileName, string? contentType, long length) =>
        IsAllowedExtension(fileName) && IsAllowedContentType(contentType) && IsAllowedSize(length);
}
