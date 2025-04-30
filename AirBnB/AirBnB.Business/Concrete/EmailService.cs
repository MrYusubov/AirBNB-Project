using System.Net;
using System.Net.Mail;
using AirBnB.Business.Abstract;
using Microsoft.Extensions.Configuration;

namespace AirBnB.Business.Concrete;

public class EmailService:IEmailService
{
    private readonly IConfiguration _configuration;
    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var emailSettings = _configuration.GetSection("Email");

        var smtpClient = new SmtpClient(emailSettings["SmtpServer"])
        {
            Port = int.Parse(emailSettings["Port"]),
            Credentials = new NetworkCredential(emailSettings["Username"], emailSettings["Password"]),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(emailSettings["FromEmail"]),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }
}