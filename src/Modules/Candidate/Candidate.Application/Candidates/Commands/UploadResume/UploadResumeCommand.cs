using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Common;
using Candidate.Application.Common.Interfaces;
using Candidate.Application.Common.Models;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Candidate.Application.Candidates.Commands.UploadResume;

/// <summary>
/// FR-CD-02: upload a resume (PDF/DOCX, max 5 MB) to Blob Storage and persist only its URL.
/// </summary>
public record UploadResumeCommand(Guid CandidateProfileId, ResumeUpload File) : IRequest<CandidateProfileDto>;

public class UploadResumeCommandValidator : AbstractValidator<UploadResumeCommand>
{
    public UploadResumeCommandValidator()
    {
        RuleFor(x => x.CandidateProfileId).NotEmpty();
        RuleFor(x => x.File).NotNull();

        When(x => x.File is not null, () =>
        {
            RuleFor(x => x.File.Length)
                .Must(ResumeValidationRules.IsAllowedSize)
                .WithMessage($"Resume must be greater than 0 bytes and at most {ResumeValidationRules.MaxSizeBytes / (1024 * 1024)} MB.");

            RuleFor(x => x.File.ContentType)
                .Must(ResumeValidationRules.IsAllowedContentType)
                .WithMessage("Resume must be a PDF or DOCX file (by content type).");

            RuleFor(x => x.File.FileName)
                .Must(ResumeValidationRules.IsAllowedExtension)
                .WithMessage("Resume must have a .pdf or .docx extension.");
        });
    }
}

public class UploadResumeCommandHandler : IRequestHandler<UploadResumeCommand, CandidateProfileDto>
{
    private readonly ICandidateDbContext _db;
    private readonly IResumeStorageService _storage;

    public UploadResumeCommandHandler(ICandidateDbContext db, IResumeStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    public async Task<CandidateProfileDto> Handle(UploadResumeCommand request, CancellationToken cancellationToken)
    {
        var profile = await _db.CandidateProfiles
            .Include(p => p.Skills)
            .FirstOrDefaultAsync(p => p.Id == request.CandidateProfileId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.CandidateProfile), request.CandidateProfileId);

        var url = await _storage.UploadResumeAsync(profile.Id, request.File, cancellationToken);

        profile.SetResumeUrl(url);
        await _db.SaveChangesAsync(cancellationToken);

        return CandidateProfileDto.FromEntity(profile);
    }
}
