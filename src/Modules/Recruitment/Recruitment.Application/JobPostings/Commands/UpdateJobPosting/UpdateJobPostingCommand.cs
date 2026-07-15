using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Recruitment.Application.JobPostings.Commands.UpdateJobPosting;

/// <summary>Recruiter edits a job posting.</summary>
public record UpdateJobPostingCommand(
    Guid Id,
    string Title,
    string Description,
    string Location,
    EmploymentType EmploymentType,
    int MinExperienceYears,
    IReadOnlyList<Guid> SkillIds) : IRequest<JobPostingDto>;

public class UpdateJobPostingCommandValidator : AbstractValidator<UpdateJobPostingCommand>
{
    public UpdateJobPostingCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Location).MaximumLength(200);
        RuleFor(x => x.MinExperienceYears).GreaterThanOrEqualTo(0).LessThanOrEqualTo(80);
        RuleFor(x => x.EmploymentType).IsInEnum();
    }
}

public class UpdateJobPostingCommandHandler : IRequestHandler<UpdateJobPostingCommand, JobPostingDto>
{
    private readonly IRecruitmentDbContext _db;

    public UpdateJobPostingCommandHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<JobPostingDto> Handle(UpdateJobPostingCommand request, CancellationToken cancellationToken)
    {
        var job = await _db.JobPostings
            .Include(j => j.Skills)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(JobPosting), request.Id);

        job.UpdateDetails(
            request.Title,
            request.Description,
            request.Location,
            request.EmploymentType,
            request.MinExperienceYears);

        job.ReplaceSkills(request.SkillIds ?? Array.Empty<Guid>());

        await _db.SaveChangesAsync(cancellationToken);

        return JobPostingDto.FromEntity(job);
    }
}
