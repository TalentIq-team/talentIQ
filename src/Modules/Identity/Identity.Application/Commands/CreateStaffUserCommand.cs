using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using MediatR;

namespace Identity.Application.Commands;

public sealed record CreateStaffUserCommand(
    string Email,
    string Password,
    UserRole Role,
    Guid OrganizationId,
    Guid? DepartmentId,
    Guid ActorUserId,
    string? IpAddress
) : IRequest<AdminUserDto>;

public sealed class CreateStaffUserCommandHandler
    : IRequestHandler<CreateStaffUserCommand, AdminUserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAppPasswordHasher _passwordHasher;
    private readonly IAuditLogRepository _auditLogRepository;

    public CreateStaffUserCommandHandler(
        IUserRepository userRepository,
        IAppPasswordHasher passwordHasher,
        IAuditLogRepository auditLogRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<AdminUserDto> Handle(
        CreateStaffUserCommand request,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(typeof(UserRole), request.Role))
        {
            throw new ArgumentException("Invalid user role.");
        }

        if (request.Role == UserRole.Candidate)
        {
            throw new ArgumentException(
                "Staff role must be Recruiter, HiringManager, or Admin.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        if (await _userRepository.EmailExistsAsync(
                email,
                cancellationToken))
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash =
                _passwordHasher.HashPassword(request.Password),
            Role = request.Role,
            OrganizationId = request.OrganizationId,
            DepartmentId = request.DepartmentId,
            IsActive = true
        };

        await _userRepository.AddAsync(user, cancellationToken);

        await _auditLogRepository.AddAsync(
            new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = request.ActorUserId,
                Action =
                    $"Created staff user {user.Id} ({user.Email}) with role {user.Role}.",
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
