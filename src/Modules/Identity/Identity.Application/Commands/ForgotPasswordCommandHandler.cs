using Identity.Application.Interfaces;
using MediatR;
using Notification.Application.Interfaces;

namespace Identity.Application.Commands;

public sealed class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(
        IUserRepository userRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ArgumentException("Email is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        // Security best practice: do not leak if email exists or not.
        // We will pretend to succeed even if user doesn't exist.
        if (user is null || !user.IsActive)
        {
            return;
        }

        // Generate a 6-digit numeric reset token
        var random = new Random();
        var token = random.Next(100000, 999999).ToString();

        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15); // Valid for 15 minutes

        await _userRepository.SaveChangesAsync(cancellationToken);

        // Send password reset email
        var emailBody = $@"
            <h3>TalentIQ Password Reset Request</h3>
            <p>You requested a password reset for your TalentIQ account.</p>
            <p>Please use the following 6-digit verification code to reset your password:</p>
            <h2 style='color:#0466C8; letter-spacing: 2px;'>{token}</h2>
            <p>This code is valid for 15 minutes. If you did not request this, you can ignore this email.</p>
            <br/>
            <p>Thanks,</p>
            <p>The TalentIQ Team</p>";

        await _emailService.SendEmailAsync(
            user.Email,
            "TalentIQ — Password Reset Verification Code",
            emailBody,
            null,
            null);
    }
}
