using Identity.Application.DTOs;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed record RegisterUserCommand(
    string Email,
    string Password,
    UserRole Role,
    Guid OrganizationId,
    Guid? DepartmentId
) : IRequest<AuthResultDto>;
