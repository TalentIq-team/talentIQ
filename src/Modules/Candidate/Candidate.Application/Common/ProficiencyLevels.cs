namespace Candidate.Application.Common;

/// <summary>
/// Allowed self-declared skill proficiency levels for a candidate profile (FR-CD-01).
/// Shared by the FluentValidation validators and tests.
/// </summary>
public static class ProficiencyLevels
{
    public const string Beginner = "Beginner";
    public const string Intermediate = "Intermediate";
    public const string Advanced = "Advanced";
    public const string Expert = "Expert";

    public static readonly IReadOnlyCollection<string> All = new[]
    {
        Beginner, Intermediate, Advanced, Expert
    };

    public static bool IsValid(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        All.Contains(value, StringComparer.OrdinalIgnoreCase);
}
