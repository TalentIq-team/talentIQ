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
    Guid? DepartmentId
) : IRequest<AdminUserDto>;

public sealed class CreateStaffUserCommandHandler
    : IRequestHandler<CreateStaffUserCommand, AdminUserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAppPasswordHasher _passwordHasher;

    public CreateStaffUserCommandHandler(
        IUserRepository userRepository,
        IAppPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<AdminUserDto> Handle(
        CreateStaffUserCommand request,
        CancellationToken cancellationToken)
    {
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
