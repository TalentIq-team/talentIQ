using Candidate.Application.Common.Interfaces;
using Candidate.Application.Common.Models;

namespace TalentIQ.IntegrationTests;

/// <summary>Test double for Blob storage — returns a fake URL without contacting Azurite.</summary>
public class FakeResumeStorageService : IResumeStorageService
{
    public Task<string> UploadResumeAsync(Guid candidateProfileId, ResumeUpload upload, CancellationToken cancellationToken = default)
        => Task.FromResult($"https://fake.blob/resumes/{candidateProfileId}/{Guid.NewGuid()}");
}
