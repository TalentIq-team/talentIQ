using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed record ChangeUserRoleCommand(
    Guid UserId,
    UserRole Role,
    Guid ActorUserId,
    string? IpAddress
) : IRequest<AdminUserDto>;

public sealed class ChangeUserRoleCommandHandler
    : IRequestHandler<ChangeUserRoleCommand, AdminUserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogRepository _auditLogRepository;

    public ChangeUserRoleCommandHandler(
        IUserRepository userRepository,
        IAuditLogRepository auditLogRepository)
    {
        _userRepository = userRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<AdminUserDto> Handle(
        ChangeUserRoleCommand request,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(typeof(UserRole), request.Role))
        {
            throw new ArgumentException("Invalid user role.");
        }

        var user = await _userRepository.GetByIdAsync(
            request.UserId,
            cancellationToken);

        if (user is null)
        {
            throw new KeyNotFoundException("User was not found.");
        }

        var previousRole = user.Role;
        user.Role = request.Role;

        await _auditLogRepository.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = request.ActorUserId,
                Action =
                    $"Changed user {user.Id} ({user.Email}) role from {previousRole} to {user.Role}.",
                Timestamp = DateTime.UtcNow,
                IpAddress = request.IpAddress
            },
            cancellationToken);

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
