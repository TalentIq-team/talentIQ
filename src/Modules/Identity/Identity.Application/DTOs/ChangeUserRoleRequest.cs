using Identity.Domain.Entities;

namespace Identity.Application.DTOs;

public sealed class ChangeUserRoleRequest
{
    public UserRole Role { get; set; }
}
