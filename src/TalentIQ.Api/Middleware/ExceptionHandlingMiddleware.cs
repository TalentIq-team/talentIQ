using System.Net;
using System.Text.Json;
using Candidate.Domain.Exceptions;
using FluentValidation;
using Recruitment.Domain.Exceptions;
using TalentIQ.Shared.Kernel.Exceptions;

namespace TalentIQ.Api.Middleware;

/// <summary>
/// Translates domain/application exceptions into RFC 7807 ProblemDetails-style JSON responses.
/// Keeps controllers thin (they never catch these exceptions themselves).
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception)
    {
        var (status, title, errors) = exception switch
        {
            ValidationException validation => (
                HttpStatusCode.BadRequest,
                "One or more validation errors occurred.",
                validation.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())),

            NotFoundException => (HttpStatusCode.NotFound, exception.Message, null),
            ConflictException => (HttpStatusCode.Conflict, exception.Message, null),
            InvalidStageTransitionException => (HttpStatusCode.Conflict, exception.Message, null),
            ResumeStorageException => (HttpStatusCode.ServiceUnavailable, exception.Message, null),
            RecruitmentDomainException => (HttpStatusCode.BadRequest, exception.Message, null),
            CandidateDomainException => (HttpStatusCode.BadRequest, exception.Message, null),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.", (Dictionary<string, string[]>?)null)
        };

        if (status == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception processing {Path}", context.Request.Path);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;

        var payload = new
        {
            status = (int)status,
            title,
            errors
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
