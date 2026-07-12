namespace Recruitment.Domain.Exceptions;

/// <summary>
/// Raised when a Recruitment domain invariant or business rule is violated.
/// </summary>
public class RecruitmentDomainException : Exception
{
    public RecruitmentDomainException(string message) : base(message)
    {
    }
}
