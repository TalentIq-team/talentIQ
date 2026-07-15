using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Recruitment.Application.Common.Behaviors;

namespace Recruitment.Application;

/// <summary>Registers the Recruitment application layer (MediatR handlers, validators, pipeline).</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddRecruitmentApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
        services.AddValidatorsFromAssembly(assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}
