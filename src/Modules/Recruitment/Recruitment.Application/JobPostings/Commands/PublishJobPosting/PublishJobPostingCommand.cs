using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Recruitment.Application.JobPostings.Commands.PublishJobPosting;

/// <summary>Recruiter publishes a job posting, making it visible to candidate job search.</summary>
public record PublishJobPostingCommand(Guid Id) : IRequest<JobPostingDto>;

public class PublishJobPostingCommandHandler : IRequestHandler<PublishJobPostingCommand, JobPostingDto>
{
    private readonly IRecruitmentDbContext _db;

    public PublishJobPostingCommandHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<JobPostingDto> Handle(PublishJobPostingCommand request, CancellationToken cancellationToken)
    {
        var job = await _db.JobPostings
            .Include(j => j.Skills)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(JobPosting), request.Id);

        job.Publish();
        await _db.SaveChangesAsync(cancellationToken);

        return JobPostingDto.FromEntity(job);
    }
}
