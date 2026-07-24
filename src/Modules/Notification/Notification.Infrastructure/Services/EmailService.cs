using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Notification.Application.Interfaces;
using Notification.Infrastructure.Settings;

namespace Notification.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(EmailSettings settings)
    {
        _settings = settings;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string body,
        byte[]? attachment = null,
        string? attachmentName = null)
    {
        var message = new MimeMessage();

        message.From.Add(new MailboxAddress(
            _settings.SenderName,
            _settings.SenderEmail));

        message.To.Add(MailboxAddress.Parse(toEmail));

        message.Subject = subject;

        var builder = new BodyBuilder
        {
            HtmlBody = body
        };

        if (attachment != null && attachmentName != null)
        {
            builder.Attachments.Add(
                attachmentName,
                attachment);
        }

        message.Body = builder.ToMessageBody();

        try
        {
            if (!string.IsNullOrEmpty(_settings.SmtpServer))
            {
                using var client = new SmtpClient();

                await client.ConnectAsync(
                    _settings.SmtpServer,
                    _settings.Port > 0 ? _settings.Port : 587,
                    SecureSocketOptions.StartTls);

                if (!string.IsNullOrEmpty(_settings.Username) && !string.IsNullOrEmpty(_settings.Password))
                {
                    await client.AuthenticateAsync(
                        _settings.Username,
                        _settings.Password);
                }

                await client.SendAsync(message);

                await client.DisconnectAsync(true);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] SMTP Notice: {ex.Message}. Notification saved to Database & UI Notification Inbox.");
        }
    }
}