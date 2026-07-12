using FluentValidation;
using MediatR;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Domain.Entities;

namespace Recruitment.Application.JobPostings.Commands.CreateJobPosting;

/// <summary>Recruiter creates a job posting (starts in Draft).</summary>
public record CreateJobPostingCommand(
    Guid OrganizationId,
    Guid RecruiterId,
    string Title,
    string Description,
    string Location,
    EmploymentType EmploymentType,
    int MinExperienceYears,
    IReadOnlyList<Guid> SkillIds) : IRequest<JobPostingDto>;

public class CreateJobPostingCommandValidator : AbstractValidator<CreateJobPostingCommand>
{
    public CreateJobPostingCommandValidator()
    {
        RuleFor(x => x.OrganizationId).NotEmpty();
        RuleFor(x => x.RecruiterId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Location).MaximumLength(200);
        RuleFor(x => x.MinExperienceYears).GreaterThanOrEqualTo(0).LessThanOrEqualTo(80);
        RuleFor(x => x.EmploymentType).IsInEnum();
    }
}

public class CreateJobPostingCommandHandler : IRequestHandler<CreateJobPostingCommand, JobPostingDto>
{
    private readonly IRecruitmentDbContext _db;

    public CreateJobPostingCommandHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<JobPostingDto> Handle(CreateJobPostingCommand request, CancellationToken cancellationToken)
    {
        var job = JobPosting.Create(
            request.OrganizationId,
            request.RecruiterId,
            request.Title,
            request.Description,
            request.Location,
            request.EmploymentType,
            request.MinExperienceYears);

        if (request.SkillIds is { Count: > 0 })
        {
            job.ReplaceSkills(request.SkillIds);
        }

        _db.JobPostings.Add(job);
        await _db.SaveChangesAsync(cancellationToken);

        return JobPostingDto.FromEntity(job);
    }
}
