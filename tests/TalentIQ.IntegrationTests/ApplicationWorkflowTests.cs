using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace TalentIQ.IntegrationTests;

/// <summary>
/// End-to-end workflow (FR-CD-03/04/05): create job → publish → submit application →
/// advance stage → verify stage history is recorded.
/// </summary>
public class ApplicationWorkflowTests : IClassFixture<TalentIQApiFactory>
{
    private readonly TalentIQApiFactory _factory;
    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };

    public ApplicationWorkflowTests(TalentIQApiFactory factory) => _factory = factory;

    [Fact]
    public async Task FullWorkflow_CreateJob_Apply_AdvanceStage_RecordsHistory()
    {
        var client = _factory.CreateAuthenticatedClient();

        // 1. Create a job posting (starts as Draft).
        var createJob = await client.PostAsJsonAsync("/api/v1/jobs", new
        {
            organizationId = Guid.NewGuid(),
            recruiterId = Guid.NewGuid(),
            title = "Senior .NET Engineer",
            description = "Build TalentIQ.",
            location = "Colombo",
            employmentType = 1, // FullTime
            minExperienceYears = 3,
            skillIds = Array.Empty<Guid>()
        });
        createJob.StatusCode.Should().Be(HttpStatusCode.Created);
        var job = await Deserialize(createJob);
        var jobId = job.GetProperty("id").GetGuid();

        // 2. Publish it so candidates can apply.
        var publish = await client.PostAsync($"/api/v1/jobs/{jobId}/publish", null);
        publish.StatusCode.Should().Be(HttpStatusCode.OK);
        (await Deserialize(publish)).GetProperty("status").GetInt32().Should().Be(2); // Published

        // 3. Submit an application (FR-CD-04).
        var candidateProfileId = Guid.NewGuid();
        var submit = await client.PostAsJsonAsync("/api/v1/applications", new
        {
            jobPostingId = jobId,
            candidateProfileId
        });
        submit.StatusCode.Should().Be(HttpStatusCode.Created);
        var application = await Deserialize(submit);
        var applicationId = application.GetProperty("id").GetGuid();
        application.GetProperty("stage").GetInt32().Should().Be(1); // Applied

        // 4. Advance the stage Applied → Screening.
        var advance = await client.PutAsJsonAsync($"/api/v1/applications/{applicationId}/stage", new
        {
            targetStage = 2, // Screening
            note = "Passed initial screen."
        });
        advance.StatusCode.Should().Be(HttpStatusCode.OK);

        // 5. Verify current stage and recorded history (FR-CD-05).
        var get = await client.GetAsync($"/api/v1/applications/{applicationId}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await Deserialize(get);

        detail.GetProperty("stage").GetInt32().Should().Be(2); // Screening
        var history = detail.GetProperty("stageHistory");
        history.GetArrayLength().Should().Be(1);
        history[0].GetProperty("fromStage").GetInt32().Should().Be(1); // Applied
        history[0].GetProperty("toStage").GetInt32().Should().Be(2);   // Screening
    }

    [Fact]
    public async Task SubmitApplication_Twice_SecondReturnsConflict()
    {
        var client = _factory.CreateAuthenticatedClient();

        var createJob = await client.PostAsJsonAsync("/api/v1/jobs", new
        {
            organizationId = Guid.NewGuid(),
            recruiterId = Guid.NewGuid(),
            title = "QA Engineer",
            description = "Testing",
            location = "Remote",
            employmentType = 1,
            minExperienceYears = 1,
            skillIds = Array.Empty<Guid>()
        });
        var jobId = (await Deserialize(createJob)).GetProperty("id").GetGuid();
        await client.PostAsync($"/api/v1/jobs/{jobId}/publish", null);

        var candidateProfileId = Guid.NewGuid();
        var first = await client.PostAsJsonAsync("/api/v1/applications", new { jobPostingId = jobId, candidateProfileId });
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        var second = await client.PostAsJsonAsync("/api/v1/applications", new { jobPostingId = jobId, candidateProfileId });
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task AdvanceStage_InvalidTransition_ReturnsConflict()
    {
        var client = _factory.CreateAuthenticatedClient();

        var createJob = await client.PostAsJsonAsync("/api/v1/jobs", new
        {
            organizationId = Guid.NewGuid(),
            recruiterId = Guid.NewGuid(),
            title = "Data Analyst",
            description = "Analytics",
            location = "Kandy",
            employmentType = 1,
            minExperienceYears = 0,
            skillIds = Array.Empty<Guid>()
        });
        var jobId = (await Deserialize(createJob)).GetProperty("id").GetGuid();
        await client.PostAsync($"/api/v1/jobs/{jobId}/publish", null);

        var submit = await client.PostAsJsonAsync("/api/v1/applications", new { jobPostingId = jobId, candidateProfileId = Guid.NewGuid() });
        var applicationId = (await Deserialize(submit)).GetProperty("id").GetGuid();

        // Applied → Hired is illegal.
        var advance = await client.PutAsJsonAsync($"/api/v1/applications/{applicationId}/stage", new { targetStage = 7, note = (string?)null });
        advance.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task CreateProfile_ThenUploadInvalidResume_ReturnsBadRequest()
    {
        var client = _factory.CreateAuthenticatedClient();

        var createProfile = await client.PostAsJsonAsync("/api/v1/candidates/profile", new
        {
            userId = Guid.NewGuid(),
            professionalSummary = "Experienced engineer",
            yearsOfExperience = 5,
            skillIds = Array.Empty<Guid>()
        });
        createProfile.StatusCode.Should().Be(HttpStatusCode.Created);
        var profileId = (await Deserialize(createProfile)).GetProperty("id").GetGuid();

        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(new byte[] { 1, 2, 3 });
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/plain");
        content.Add(fileContent, "file", "malware.exe");
        content.Add(new StringContent(profileId.ToString()), "candidateProfileId");

        var upload = await client.PostAsync("/api/v1/candidates/resume", content);
        upload.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private static async Task<JsonElement> Deserialize(HttpResponseMessage response)
    {
        var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        return doc.RootElement.Clone();
    }
}
