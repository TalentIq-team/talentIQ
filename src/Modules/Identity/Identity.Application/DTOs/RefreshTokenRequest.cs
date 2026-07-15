namespace Identity.Application.DTOs;

public sealed class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
