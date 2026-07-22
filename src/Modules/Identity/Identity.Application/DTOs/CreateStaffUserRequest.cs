using System.Text.Json.Serialization;
using Identity.Domain.Entities;

namespace Identity.Application.DTOs;

public sealed class CreateStaffUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid? DepartmentId { get; set; }
}
