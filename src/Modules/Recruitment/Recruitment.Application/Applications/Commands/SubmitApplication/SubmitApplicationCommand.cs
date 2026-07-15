using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Applications.Events;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace Recruitment.Application.Applications.Commands.SubmitApplication;

/// <summary>FR-CD-04: candidate applies to a published job posting.</summary>
public record SubmitApplicationCommand(Guid JobPostingId, Guid CandidateProfileId) : IRequest<ApplicationDto>;

public class SubmitApplicationCommandValidator : AbstractValidator<SubmitApplicationCommand>
{
    public SubmitApplicationCommandValidator()
    {
        RuleFor(x => x.JobPostingId).NotEmpty();
        RuleFor(x => x.CandidateProfileId).NotEmpty();
    }
}

public class SubmitApplicationCommandHandler : IRequestHandler<SubmitApplicationCommand, ApplicationDto>
{
    private readonly IRecruitmentDbContext _db;
    private readonly IPublisher _publisher;

    public SubmitApplicationCommandHandler(IRecruitmentDbContext db, IPublisher publisher)
    {
        _db = db;
        _publisher = publisher;
    }

    public async Task<ApplicationDto> Handle(SubmitApplicationCommand request, CancellationToken cancellationToken)
    {
        var job = await _db.JobPostings
            .FirstOrDefaultAsync(j => j.Id == request.JobPostingId, cancellationToken)
            ?? throw new NotFoundException(nameof(JobPosting), request.JobPostingId);

        if (job.Status != JobPostingStatus.Published)
        {
            throw new ConflictException("Applications can only be submitted to published job postings.");
        }

        // Business rule: one ACTIVE application per job per candidate.
        // "Active" = not yet in a terminal stage (Hired / Rejected).
        var hasActiveApplication = await _db.Applications.AnyAsync(
            a => a.JobPostingId == request.JobPostingId
                 && a.CandidateProfileId == request.CandidateProfileId
                 && a.Stage != ApplicationStage.Hired
                 && a.Stage != ApplicationStage.Rejected,
            cancellationToken);

        if (hasActiveApplication)
        {
            throw new ConflictException("You already have an active application for this job.");
        }

        var application = ApplicationEntity.Submit(request.JobPostingId, request.CandidateProfileId);
        _db.Applications.Add(application);
        await _db.SaveChangesAsync(cancellationToken);

        // Publish only — consumers (AI / notifications / analytics) are owned by other members.
        await _publisher.Publish(
            new ApplicationSubmittedEvent(application.Id, application.JobPostingId, application.CandidateProfileId, application.AppliedAt),
            cancellationToken);

        return ApplicationDto.FromEntity(application);
    }
}
