namespace Candidate.Domain.Exceptions;

/// <summary>
/// Raised when a Candidate domain invariant or business rule is violated.
/// </summary>
public class CandidateDomainException : Exception
{
    public CandidateDomainException(string message) : base(message)
    {
    }
}
