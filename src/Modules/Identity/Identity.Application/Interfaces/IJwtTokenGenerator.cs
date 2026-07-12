using Identity.Domain.Entities;

namespace Identity.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(User user);

    string GenerateRefreshToken();

    DateTime GetAccessTokenExpiry();
}