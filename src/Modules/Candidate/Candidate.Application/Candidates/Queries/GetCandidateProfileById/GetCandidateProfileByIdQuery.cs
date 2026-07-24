using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Candidate.Application.Candidates.Queries.GetCandidateProfileById;

/// <summary>FR-CD-01: view a candidate profile by id with all enterprise child sections.</summary>
public record GetCandidateProfileByIdQuery(Guid Id) : IRequest<CandidateProfileDto>;

public class GetCandidateProfileByIdQueryHandler
    : IRequestHandler<GetCandidateProfileByIdQuery, CandidateProfileDto>
{
    private readonly ICandidateDbContext _db;

    public GetCandidateProfileByIdQueryHandler(ICandidateDbContext db) => _db = db;

    public async Task<CandidateProfileDto> Handle(GetCandidateProfileByIdQuery request, CancellationToken cancellationToken)
    {
        var profile = await _db.CandidateProfiles
            .AsNoTracking()
            .Include(p => p.Skills).ThenInclude(s => s.Skill)
            .Include(p => p.Experiences)
            .Include(p => p.Educations)
            .Include(p => p.Projects)
            .Include(p => p.Certifications)
            .Include(p => p.Languages)
            .Include(p => p.Achievements)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.CandidateProfile), request.Id);

        return CandidateProfileDto.FromEntity(profile);
    }
}
