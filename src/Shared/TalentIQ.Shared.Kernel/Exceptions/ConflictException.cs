namespace TalentIQ.Shared.Kernel.Exceptions;

/// <summary>
/// Thrown when an operation conflicts with the current state of a resource
/// (e.g. a business rule such as "one active application per job").
/// Mapped to HTTP 409 by the API's exception-handling middleware.
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
