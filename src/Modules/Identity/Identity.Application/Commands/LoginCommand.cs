using Identity.Application.DTOs;
using MediatR;

namespace Identity.Application.Commands;

public sealed record LoginCommand(
    string Email,
    string Password
) : IRequest<AuthResultDto>;