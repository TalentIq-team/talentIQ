using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Recruitment.Application.Applications.Commands.AdvanceApplicationStage;

/// <summary>
/// Recruiter advances (or rejects) an application to a new stage.
/// The State pattern in the domain validates the transition; the Unit of Work commits the
/// stage change AND the inserted stage-history row atomically in a single SaveChanges.
/// </summary>
public record AdvanceApplicationStageCommand(
    Guid ApplicationId,
    ApplicationStage TargetStage,
    Guid? ChangedByUserId = null,
    string? Note = null) : IRequest<ApplicationDetailDto>;

public class AdvanceApplicationStageCommandValidator : AbstractValidator<AdvanceApplicationStageCommand>
{
    public AdvanceApplicationStageCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.TargetStage).IsInEnum();
        RuleFor(x => x.Note).MaximumLength(1000);
    }
}

public class AdvanceApplicationStageCommandHandler
    : IRequestHandler<AdvanceApplicationStageCommand, ApplicationDetailDto>
{
    private readonly IRecruitmentDbContext _db;
    private readonly IUnitOfWork _unitOfWork;

    public AdvanceApplicationStageCommandHandler(IRecruitmentDbContext db, IUnitOfWork unitOfWork)
    {
        _db = db;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApplicationDetailDto> Handle(AdvanceApplicationStageCommand request, CancellationToken cancellationToken)
    {
        var application = await _db.Applications
            .Include(a => a.StageHistory)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, cancellationToken)
            ?? throw new NotFoundException("Application", request.ApplicationId);

        // Operation 1: update the application's stage.
        // Operation 2: append a stage-history record (both mutations happen on the aggregate).
        application.AdvanceTo(request.TargetStage, request.ChangedByUserId, request.Note);

        // Operation 3: commit both changes once, atomically.
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApplicationDetailDto.FromEntity(application);
    }
}
