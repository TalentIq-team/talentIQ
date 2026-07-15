using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace TalentIQ.Api.Services;

/// <summary>
/// Issues development JWTs signed with the same key the API validates against, so Swagger/manual
/// testing works without the Identity module being wired up. Registered only for Development use
/// (see <c>DevAuthController</c>); production token issuance remains the Identity module's job.
/// </summary>
public class DevTokenService
{
    private readonly string _signingKey;

    public DevTokenService(IConfiguration configuration)
    {
        _signingKey = configuration["Jwt:SigningKey"]
            ?? configuration["JWT_SIGNING_KEY"]
            ?? "insecure-development-signing-key-change-me-minimum-32-chars";
    }

    public (string Token, Guid UserId, DateTime ExpiresAt) CreateToken(Guid? userId = null, int lifetimeHours = 8)
    {
        var id = userId ?? Guid.NewGuid();
        var expires = DateTime.UtcNow.AddHours(lifetimeHours);

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_signingKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, id.ToString())
            },
            expires: expires,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), id, expires);
    }
}
