using Candidate.Application.Candidates.Queries.GetCandidateProfileById;
using MediatR;
using Recruitment.Application.Common.Interfaces;
using TalentIQ.Shared.Kernel.Exceptions;

namespace TalentIQ.Api.Services;

/// <summary>
/// API-level adapter implementing the Recruitment module's <see cref="ICandidateSkillReader"/> by
/// querying the Candidate module (FR-RC-05). Lives in the composition root so the two modules stay
/// decoupled — neither references the other directly.
/// </summary>
public class CandidateSkillReader : ICandidateSkillReader
{
    private readonly IMediator _mediator;

    public CandidateSkillReader(IMediator mediator) => _mediator = mediator;

    public async Task<IReadOnlyList<Guid>> GetSkillIdsAsync(Guid candidateProfileId, CancellationToken cancellationToken = default)
    {
        try
        {
            var profile = await _mediator.Send(new GetCandidateProfileByIdQuery(candidateProfileId), cancellationToken);
            return profile.Skills.Select(s => s.SkillId).ToList();
        }
        catch (NotFoundException)
        {
            // Candidate profile may not exist (cross-module) — treat as "no skills" rather than failing analysis.
            return Array.Empty<Guid>();
        }
    }
}
