using Identity.Application.DTOs;
using MediatR;

namespace Identity.Application.Commands;

public sealed record RegisterUserCommand(
    string Email,
    string Password
) : IRequest<AuthResultDto>;
