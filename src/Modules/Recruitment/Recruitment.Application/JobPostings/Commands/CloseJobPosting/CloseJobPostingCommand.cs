using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Recruitment.Application.JobPostings.Commands.CloseJobPosting;

/// <summary>Recruiter closes a job posting.</summary>
public record CloseJobPostingCommand(Guid Id) : IRequest<JobPostingDto>;

public class CloseJobPostingCommandHandler : IRequestHandler<CloseJobPostingCommand, JobPostingDto>
{
    private readonly IRecruitmentDbContext _db;

    public CloseJobPostingCommandHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<JobPostingDto> Handle(CloseJobPostingCommand request, CancellationToken cancellationToken)
    {
        var job = await _db.JobPostings
            .Include(j => j.Skills)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(JobPosting), request.Id);

        job.Close();
        await _db.SaveChangesAsync(cancellationToken);

        return JobPostingDto.FromEntity(job);
    }
}
