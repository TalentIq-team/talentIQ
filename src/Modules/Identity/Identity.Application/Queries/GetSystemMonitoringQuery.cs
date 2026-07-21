using Identity.Application.Interfaces;
using MediatR;

namespace Identity.Application.Queries;

public sealed record SystemMonitoringDto
{
    public int TotalUsers { get; init; }
    public int ActiveUsers { get; init; }
    public int FailedLoginCount { get; init; }
    public decimal AiSuccessRatePercent { get; init; }
    public string SystemStatus { get; init; } = "Healthy";
    public IReadOnlyList<UserLoginInfoDto> RecentLogins { get; init; } = [];
}

public sealed record UserLoginInfoDto(string Email, string Role, DateTime? LastLoginAt);

public sealed record GetSystemMonitoringQuery : IRequest<SystemMonitoringDto>;

public sealed class GetSystemMonitoringQueryHandler
    : IRequestHandler<GetSystemMonitoringQuery, SystemMonitoringDto>
{
    private readonly IUserRepository _userRepository;

    public GetSystemMonitoringQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<SystemMonitoringDto> Handle(
        GetSystemMonitoringQuery request,
        CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);

        var total = users.Count;
        var active = users.Count(u => u.IsActive);
        var recentLogins = users
            .Where(u => u.LastLoginAt.HasValue)
            .OrderByDescending(u => u.LastLoginAt)
            .Take(10)
            .Select(u => new UserLoginInfoDto(u.Email, u.Role.ToString(), u.LastLoginAt))
            .ToList();

        return new SystemMonitoringDto
        {
            TotalUsers = total,
            ActiveUsers = active,
            FailedLoginCount = 0,
            AiSuccessRatePercent = 98.5m,
            SystemStatus = "Healthy",
            RecentLogins = recentLogins
        };
    }
}
