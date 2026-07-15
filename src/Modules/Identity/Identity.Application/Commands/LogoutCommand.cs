using Identity.Application.Interfaces;
using MediatR;

namespace Identity.Application.Commands;

public sealed record LogoutCommand(
    string RefreshToken
) : IRequest<Unit>;

public sealed class LogoutCommandHandler
    : IRequestHandler<LogoutCommand, Unit>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public LogoutCommandHandler(
        IRefreshTokenRepository refreshTokenRepository)
    {
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<Unit> Handle(
        LogoutCommand request,
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

        if (!existingToken.IsRevoked)
        {
            existingToken.IsRevoked = true;

            await _refreshTokenRepository.SaveChangesAsync(
                cancellationToken);
        }

        return Unit.Value;
    }
}
