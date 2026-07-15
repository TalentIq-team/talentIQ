using Identity.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Identity.Infrastructure.Security;

public sealed class PasswordHasher
    : global::Identity.Application.Interfaces.IAppPasswordHasher
{
    private readonly Microsoft.AspNetCore.Identity.PasswordHasher<User> _hasher
        = new();

    public string HashPassword(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        return _hasher.HashPassword(new User(), password);
    }

    public bool VerifyPassword(
        string passwordHash,
        string providedPassword)
    {
        if (string.IsNullOrWhiteSpace(passwordHash) ||
            string.IsNullOrWhiteSpace(providedPassword))
        {
            return false;
        }

        var result = _hasher.VerifyHashedPassword(
            new User(),
            passwordHash,
            providedPassword);

        return result is PasswordVerificationResult.Success
            or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
