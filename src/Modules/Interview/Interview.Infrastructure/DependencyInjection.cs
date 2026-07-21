using Interview.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Interview.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInterviewInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<InterviewDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IInterviewRepository, Repositories.InterviewRepository>();
        services.AddHostedService<Services.InterviewReminderBackgroundService>();

        return services;
    }
}