using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed record DeactivateUserCommand(
    Guid UserId,
    Guid ActorUserId,
    string? IpAddress
) : IRequest<AdminUserDto>;

public sealed class DeactivateUserCommandHandler
    : IRequestHandler<DeactivateUserCommand, AdminUserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogRepository _auditLogRepository;

    public DeactivateUserCommandHandler(
        IUserRepository userRepository,
        IAuditLogRepository auditLogRepository)
    {
        _userRepository = userRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<AdminUserDto> Handle(
        DeactivateUserCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(
            request.UserId,
            cancellationToken);

        if (user is null)
        {
            throw new KeyNotFoundException("User was not found.");
        }

        user.IsActive = false;

        await _auditLogRepository.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = request.ActorUserId,
                Action =
                    $"Deactivated user {user.Id} ({user.Email}).",
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
