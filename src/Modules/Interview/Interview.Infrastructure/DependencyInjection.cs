using Interview.Application.Interfaces;
using Interview.Application.Services;
using Interview.Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Interview.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInterviewModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<InterviewDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IInterviewRepository, Repositories.InterviewRepository>();
        services.AddScoped<ICalendarService, CalendarService>();

        // Interview application layer: commands and queries are MediatR handlers.
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(IInterviewRepository).Assembly));

        return services;
    }
}
