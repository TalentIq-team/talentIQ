using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed class LoginCommandHandler
    : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAppPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IAuditLogRepository _auditLogRepository;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IAppPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IRefreshTokenRepository refreshTokenRepository,
        IAuditLogRepository auditLogRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _refreshTokenRepository = refreshTokenRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<AuthResultDto> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        var normalizedEmail = request.Email
            .Trim()
            .ToLowerInvariant();

        var user = await _userRepository.GetByEmailAsync(
            normalizedEmail,
            cancellationToken);

        if (user is null ||
            !user.IsActive ||
            !_passwordHasher.VerifyPassword(
                user.PasswordHash,
                request.Password))
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        var refreshTokenValue =
            _jwtTokenGenerator.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenValue,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        await _refreshTokenRepository.AddAsync(
            refreshToken,
            cancellationToken);

        await _auditLogRepository.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Action = "User.Login",
                Timestamp = DateTime.UtcNow,
                IpAddress = "127.0.0.1"
            },
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
            RefreshToken = refreshTokenValue,
            ExpiresAt =
                _jwtTokenGenerator.GetAccessTokenExpiry()
        };
    }
}
