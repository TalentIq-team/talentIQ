using Identity.Application.DTOs;
using Identity.Application.Interfaces;
using MediatR;

namespace Identity.Application.Commands;

public sealed record DeactivateUserCommand(Guid UserId)
    : IRequest<AdminUserDto>;

public sealed class DeactivateUserCommandHandler
    : IRequestHandler<DeactivateUserCommand, AdminUserDto>
{
    private readonly IUserRepository _userRepository;

    public DeactivateUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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
