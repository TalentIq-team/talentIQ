using System.Security.Claims;

namespace TalentIQ.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Reads the authenticated user's id from the JWT (sub / NameIdentifier claim).
    /// Returns <see cref="Guid.Empty"/> when unavailable.
    /// </summary>
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("sub")
            ?? principal.FindFirstValue("uid");

        return Guid.TryParse(value, out var id) ? id : Guid.Empty;
    }
}
