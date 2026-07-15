using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Candidate.Application.Common.Interfaces;
using Candidate.Application.Common.Models;
using Candidate.Domain.Exceptions;

namespace Candidate.Infrastructure.Storage;

/// <summary>Options for <see cref="BlobResumeStorageService"/>.</summary>
public class BlobStorageOptions
{
    /// <summary>Azure Blob connection string. Locally this is <c>UseDevelopmentStorage=true</c> (Azurite).</summary>
    public string ConnectionString { get; set; } = "UseDevelopmentStorage=true";

    public string ResumeContainerName { get; set; } = "resumes";
}

/// <summary>
/// FR-CD-02: uploads resumes to Azure Blob Storage (Azurite locally) and returns the blob URL.
/// Only the URL is persisted to SQL Server by the calling handler.
/// </summary>
public class BlobResumeStorageService : IResumeStorageService
{
    private readonly BlobStorageOptions _options;

    public BlobResumeStorageService(BlobStorageOptions options) => _options = options;

    public async Task<string> UploadResumeAsync(Guid candidateProfileId, ResumeUpload upload, CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = new BlobContainerClient(_options.ConnectionString, _options.ResumeContainerName);
            await containerClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);

            var extension = Path.GetExtension(upload.FileName);
            var blobName = $"{candidateProfileId}/{Guid.NewGuid()}{extension}";
            var blobClient = containerClient.GetBlobClient(blobName);

            if (upload.Content.CanSeek)
            {
                upload.Content.Position = 0;
            }

            await blobClient.UploadAsync(
                upload.Content,
                new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders { ContentType = upload.ContentType }
                },
                cancellationToken);

            return blobClient.Uri.ToString();
        }
        catch (Exception ex) when (ex is RequestFailedException or FormatException or IOException or AggregateException)
        {
            // Turn infrastructure/connectivity failures (e.g. Azurite not running) into a clear
            // domain error → HTTP 503, instead of leaking an opaque 500 (FR-CD-02 reliability).
            throw new ResumeStorageException(
                "Resume storage is currently unavailable. Ensure Azure Blob Storage/Azurite is running and the connection string is valid.",
                ex);
        }
    }
}
