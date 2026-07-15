using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed record RefreshAccessTokenCommand(
    string RefreshToken
) : IRequest<AuthResultDto>;

public sealed class RefreshAccessTokenCommandHandler
    : IRequestHandler<RefreshAccessTokenCommand, AuthResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RefreshAccessTokenCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResultDto> Handle(
        RefreshAccessTokenCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new UnauthorizedAccessException(
                "Refresh token is required.");
        }

        var existingToken =
            await _refreshTokenRepository.GetByTokenAsync(
                request.RefreshToken.Trim(),
                cancellationToken);

        if (existingToken is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid refresh token.");
        }

        if (existingToken.IsRevoked)
        {
            throw new UnauthorizedAccessException(
                "Refresh token has already been revoked.");
        }

        if (existingToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException(
                "Refresh token has expired.");
        }

        var user = await _userRepository.GetByIdAsync(
            existingToken.UserId,
            cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedAccessException(
                "User account is unavailable.");
        }

        existingToken.IsRevoked = true;

        var newRefreshTokenValue =
            _jwtTokenGenerator.GenerateRefreshToken();

        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshTokenValue,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        await _refreshTokenRepository.AddAsync(
            newRefreshToken,
            cancellationToken);

        await _refreshTokenRepository.SaveChangesAsync(
            cancellationToken);

        return new AuthResultDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            AccessToken =
                _jwtTokenGenerator.GenerateAccessToken(user),
            RefreshToken = newRefreshTokenValue,
            ExpiresAt =
                _jwtTokenGenerator.GetAccessTokenExpiry()
        };
    }
}
