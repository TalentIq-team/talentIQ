using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Candidate.Application.Common.Interfaces;
using Candidate.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Recruitment.Infrastructure.Persistence;

namespace TalentIQ.IntegrationTests;

/// <summary>
/// Boots the real API in-memory (WebApplicationFactory) but swaps SQL Server for a shared
/// SQLite in-memory database (which supports real relational update semantics across requests)
/// and the Blob storage for a fake, so the full HTTP + MediatR + EF pipeline is exercised
/// without external infrastructure.
/// </summary>
public class TalentIQApiFactory : WebApplicationFactory<Program>
{
    public const string SigningKey = "insecure-development-signing-key-change-me-minimum-32-chars";

    // Kept open for the factory's lifetime so the in-memory databases persist across requests.
    private readonly SqliteConnection _candidateConnection = new("DataSource=:memory:");
    private readonly SqliteConnection _recruitmentConnection = new("DataSource=:memory:");

    public TalentIQApiFactory()
    {
        _candidateConnection.Open();
        _recruitmentConnection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            ReplaceWithSqlite<CandidateDbContext>(services, _candidateConnection);
            ReplaceWithSqlite<RecruitmentDbContext>(services, _recruitmentConnection);

            services.RemoveAll<IResumeStorageService>();
            services.AddScoped<IResumeStorageService, FakeResumeStorageService>();
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<CandidateDbContext>().Database.EnsureCreated();
        scope.ServiceProvider.GetRequiredService<RecruitmentDbContext>().Database.EnsureCreated();

        return host;
    }

    private static void ReplaceWithSqlite<TContext>(IServiceCollection services, SqliteConnection connection)
        where TContext : DbContext
    {
        var toRemove = services.Where(d =>
            d.ServiceType == typeof(DbContextOptions<TContext>) ||
            d.ServiceType == typeof(TContext) ||
            (d.ServiceType.IsGenericType &&
             d.ServiceType.GetGenericArguments().Contains(typeof(TContext))))
            .ToList();

        foreach (var descriptor in toRemove)
        {
            services.Remove(descriptor);
        }

        services.AddDbContext<TContext>(options => options.UseSqlite(connection));
    }

    /// <summary>Creates an authenticated HttpClient carrying a valid JWT for the given user.</summary>
    public HttpClient CreateAuthenticatedClient(Guid? userId = null)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", GenerateToken(userId ?? Guid.NewGuid()));
        return client;
    }

    private static string GenerateToken(Guid userId)
    {
        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) },
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            _candidateConnection.Dispose();
            _recruitmentConnection.Dispose();
        }
    }
}
