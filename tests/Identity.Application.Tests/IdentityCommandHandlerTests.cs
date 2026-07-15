using Identity.Application.Commands;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;

namespace Identity.Application.Tests;

public sealed class IdentityCommandHandlerTests
{
    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokensAndStoresRefreshToken()
    {
        var user = CreateUser();
        var userRepository = new FakeUserRepository(user);
        var refreshTokenRepository = new FakeRefreshTokenRepository();
        var passwordHasher = new FakePasswordHasher();
        var jwtGenerator = new FakeJwtTokenGenerator();

        var handler = new LoginCommandHandler(
            userRepository,
            passwordHasher,
            jwtGenerator,
            refreshTokenRepository);

        var result = await handler.Handle(
            new LoginCommand(
                user.Email,
                "Password@123"),
            CancellationToken.None);

        Assert.Equal(user.Id, result.UserId);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal("Admin", result.Role);
        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-token-1", result.RefreshToken);

        Assert.Single(refreshTokenRepository.Tokens);

        var storedToken = refreshTokenRepository.Tokens.Single();

        Assert.Equal(user.Id, storedToken.UserId);
        Assert.Equal(result.RefreshToken, storedToken.Token);
        Assert.False(storedToken.IsRevoked);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ThrowsUnauthorizedAccessException()
    {
        var user = CreateUser();
        var handler = new LoginCommandHandler(
            new FakeUserRepository(user),
            new FakePasswordHasher(),
            new FakeJwtTokenGenerator(),
            new FakeRefreshTokenRepository());

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => handler.Handle(
                new LoginCommand(
                    user.Email,
                    "WrongPassword"),
                CancellationToken.None));
    }

    [Fact]
    public async Task Login_WithInactiveUser_ThrowsUnauthorizedAccessException()
    {
        var user = CreateUser();
        user.IsActive = false;

        var handler = new LoginCommandHandler(
            new FakeUserRepository(user),
            new FakePasswordHasher(),
            new FakeJwtTokenGenerator(),
            new FakeRefreshTokenRepository());

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => handler.Handle(
                new LoginCommand(
                    user.Email,
                    "Password@123"),
                CancellationToken.None));
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ThrowsInvalidOperationException()
    {
        var user = CreateUser();

        var handler = new RegisterUserCommandHandler(
            new FakeUserRepository(user),
            new FakePasswordHasher(),
            new FakeJwtTokenGenerator(),
            new FakeRefreshTokenRepository());

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => handler.Handle(
                new RegisterUserCommand(
                    user.Email,
                    "Password@123"),
                CancellationToken.None));
    }

    [Fact]
    public async Task Refresh_WithValidToken_RotatesAndRevokesOldToken()
    {
        var user = CreateUser();

        var oldToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "old-refresh-token",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        var refreshRepository =
            new FakeRefreshTokenRepository(oldToken);

        var handler = new RefreshAccessTokenCommandHandler(
            new FakeUserRepository(user),
            refreshRepository,
            new FakeJwtTokenGenerator());

        var result = await handler.Handle(
            new RefreshAccessTokenCommand(
                oldToken.Token),
            CancellationToken.None);

        Assert.True(oldToken.IsRevoked);
        Assert.Equal("refresh-token-1", result.RefreshToken);
        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal(2, refreshRepository.Tokens.Count);

        var newToken = refreshRepository.Tokens
            .Single(token => token.Token == result.RefreshToken);

        Assert.False(newToken.IsRevoked);
        Assert.Equal(user.Id, newToken.UserId);
    }

    [Fact]
    public async Task Logout_WithValidToken_RevokesRefreshToken()
    {
        var token = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Token = "logout-refresh-token",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        var repository =
            new FakeRefreshTokenRepository(token);

        var handler = new LogoutCommandHandler(repository);

        await handler.Handle(
            new LogoutCommand(token.Token),
            CancellationToken.None);

        Assert.True(token.IsRevoked);
    }

    private static User CreateUser()
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = "candidate1@gmail.com",
            PasswordHash = "HASH:Password@123",
            Role = UserRole.Admin,
            OrganizationId = Guid.Empty,
            DepartmentId = null,
            IsActive = true
        };
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        private readonly List<User> _users;

        public FakeUserRepository(params User[] users)
        {
            _users = users.ToList();
        }

        public Task<User?> GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(
                _users.FirstOrDefault(user => user.Id == id));
        }

        public Task<User?> GetByEmailAsync(
            string email,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(
                _users.FirstOrDefault(
                    user => user.Email.Equals(
                        email,
                        StringComparison.OrdinalIgnoreCase)));
        }

        public Task<IReadOnlyList<User>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<User>>(
                _users.ToList());
        }

        public Task<bool> EmailExistsAsync(
            string email,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(
                _users.Any(
                    user => user.Email.Equals(
                        email,
                        StringComparison.OrdinalIgnoreCase)));
        }

        public Task AddAsync(
            User user,
            CancellationToken cancellationToken = default)
        {
            _users.Add(user);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakeRefreshTokenRepository
        : IRefreshTokenRepository
    {
        public List<RefreshToken> Tokens { get; } = new();

        public FakeRefreshTokenRepository(
            params RefreshToken[] tokens)
        {
            Tokens.AddRange(tokens);
        }

        public Task<RefreshToken?> GetByTokenAsync(
            string token,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(
                Tokens.FirstOrDefault(
                    refreshToken =>
                        refreshToken.Token == token));
        }

        public Task AddAsync(
            RefreshToken refreshToken,
            CancellationToken cancellationToken = default)
        {
            Tokens.Add(refreshToken);
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakePasswordHasher
        : IAppPasswordHasher
    {
        public string HashPassword(string password)
        {
            return $"HASH:{password}";
        }

        public bool VerifyPassword(
            string passwordHash,
            string providedPassword)
        {
            return passwordHash ==
                   $"HASH:{providedPassword}";
        }
    }

    private sealed class FakeJwtTokenGenerator
        : IJwtTokenGenerator
    {
        private int _refreshTokenNumber;

        public string GenerateAccessToken(User user)
        {
            return "access-token";
        }

        public string GenerateRefreshToken()
        {
            _refreshTokenNumber++;
            return $"refresh-token-{_refreshTokenNumber}";
        }

        public DateTime GetAccessTokenExpiry()
        {
            return DateTime.UtcNow.AddHours(1);
        }
    }
}
