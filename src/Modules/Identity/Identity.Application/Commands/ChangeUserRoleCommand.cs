using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed record ChangeUserRoleCommand(
    Guid UserId,
    UserRole Role
) : IRequest<AdminUserDto>;

public sealed class ChangeUserRoleCommandHandler
    : IRequestHandler<ChangeUserRoleCommand, AdminUserDto>
{
    private readonly IUserRepository _userRepository;

    public ChangeUserRoleCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<AdminUserDto> Handle(
        ChangeUserRoleCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(
            request.UserId,
            cancellationToken);

        if (user is null)
        {
            throw new KeyNotFoundException("User was not found.");
        }

        user.Role = request.Role;

        await _userRepository.SaveChangesAsync(cancellationToken);

        return new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            OrganizationId = user.OrganizationId,
            DepartmentId = user.DepartmentId,
            IsActive = user.IsActive
        };
    }
}
