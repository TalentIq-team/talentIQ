using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed class RegisterUserCommandHandler
    : IRequestHandler<RegisterUserCommand, AuthResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAppPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public RegisterUserCommandHandler(
        IUserRepository userRepository,
        IAppPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<AuthResultDto> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException("Password is required.");
        }

        var normalizedEmail = request.Email
            .Trim()
            .ToLowerInvariant();

        var emailExists = await _userRepository.EmailExistsAsync(
            normalizedEmail,
            cancellationToken);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash =
                _passwordHasher.HashPassword(request.Password),
            Role = UserRole.Candidate,
            OrganizationId = Guid.Empty,
            DepartmentId = null,
            IsActive = true
        };

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

        await _userRepository.AddAsync(
            user,
            cancellationToken);

        await _refreshTokenRepository.AddAsync(
            refreshToken,
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
