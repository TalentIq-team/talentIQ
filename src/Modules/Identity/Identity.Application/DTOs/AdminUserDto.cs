namespace Identity.Application.DTOs;

public sealed class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public Guid? DepartmentId { get; set; }
    public bool IsActive { get; set; }
}
