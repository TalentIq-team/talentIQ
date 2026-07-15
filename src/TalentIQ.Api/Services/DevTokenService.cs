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
    private readonly string _issuer;
    private readonly string _audience;

    public DevTokenService(IConfiguration configuration)
    {
        // Prefer Jwt:Key (the key the API validates against) so dev tokens always verify.
        _signingKey = configuration["Jwt:Key"]
            ?? configuration["Jwt:SigningKey"]
            ?? configuration["JWT_SIGNING_KEY"]
            ?? throw new InvalidOperationException(
                "JWT signing key is not configured. Set it in .env (Jwt__Key).");

        // Match the issuer/audience the API validates (same defaults as Program.cs).
        _issuer = configuration["Jwt:Issuer"] ?? "TalentIQ.Api";
        _audience = configuration["Jwt:Audience"] ?? "TalentIQ.Client";
    }

    public (string Token, Guid UserId, DateTime ExpiresAt) CreateToken(Guid? userId = null, int lifetimeHours = 8)
    {
        var id = userId ?? Guid.NewGuid();
        var expires = DateTime.UtcNow.AddHours(lifetimeHours);

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_signingKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
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
