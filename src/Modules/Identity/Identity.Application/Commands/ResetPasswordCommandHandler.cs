using Identity.Application.Interfaces;
using MediatR;

namespace Identity.Application.Commands;

public sealed class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IAppPasswordHasher _passwordHasher;

    public ResetPasswordCommandHandler(
        IUserRepository userRepository,
        IAppPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Token))
        {
            throw new ArgumentException("Verification code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            throw new ArgumentException("New password is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null ||
            user.PasswordResetToken != request.Token.Trim() ||
            user.PasswordResetTokenExpiresAt is null ||
            user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
        {
            throw new ArgumentException("Invalid or expired verification code.");
        }

        // Hash and update the password
        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        
        // Clear the reset token fields
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;

        await _userRepository.SaveChangesAsync(cancellationToken);
    }
}
