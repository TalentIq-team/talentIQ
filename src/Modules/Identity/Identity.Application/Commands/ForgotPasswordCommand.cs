using MediatR;

namespace Identity.Application.Commands;

public sealed record ForgotPasswordCommand(
    string Email
) : IRequest;
