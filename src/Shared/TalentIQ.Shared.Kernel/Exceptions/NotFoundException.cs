namespace TalentIQ.Shared.Kernel.Exceptions;

/// <summary>
/// Thrown by application handlers when a requested entity does not exist.
/// Mapped to HTTP 404 by the API's exception-handling middleware.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }

    public NotFoundException(string entityName, object key)
        : base($"{entityName} with key '{key}' was not found.")
    {
    }
}
