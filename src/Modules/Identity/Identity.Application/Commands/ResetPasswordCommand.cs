using MediatR;

namespace Identity.Application.Commands;

public sealed record ResetPasswordCommand(
    string Email,
    string Token,
    string NewPassword
) : IRequest;
