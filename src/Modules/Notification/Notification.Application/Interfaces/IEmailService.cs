namespace Notification.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(
        string toEmail,
        string subject,
        string body,
        byte[]? attachment = null,
        string? attachmentName = null);
}