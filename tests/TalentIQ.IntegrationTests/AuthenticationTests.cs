using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace TalentIQ.IntegrationTests;

/// <summary>Auth enforcement: protected endpoints require a valid JWT; anonymous search does not.</summary>
public class AuthenticationTests : IClassFixture<TalentIQApiFactory>
{
    private readonly TalentIQApiFactory _factory;

    public AuthenticationTests(TalentIQApiFactory factory) => _factory = factory;

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient(); // no Authorization header

        var response = await client.PostAsJsonAsync("/api/v1/candidates/profile", new
        {
            userId = Guid.NewGuid(),
            professionalSummary = "x",
            yearsOfExperience = 1,
            skills = Array.Empty<object>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithValidToken_Succeeds()
    {
        var client = _factory.CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/v1/candidates/profile", new
        {
            userId = Guid.NewGuid(),
            professionalSummary = "Authorized engineer",
            yearsOfExperience = 4,
            skills = Array.Empty<object>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task JobSearch_IsAnonymous_Returns200WithoutToken()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/v1/jobs");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
