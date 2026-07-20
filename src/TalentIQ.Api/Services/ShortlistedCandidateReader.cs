using Interview.Application.DTOs;
using Interview.Application.Interfaces;
using MediatR;
using Recruitment.Application.Applications.Queries.SearchApplications;
using Recruitment.Domain.Entities;

namespace TalentIQ.Api.Services;

/// <summary>
/// API-level adapter implementing the Interview module's <see cref="IShortlistedCandidateReader"/>
/// by querying the Recruitment module for applications in the Shortlisted stage. Lives in the
/// composition root so the two modules stay decoupled — neither references the other.
/// Mirrors the existing <see cref="CandidateSkillReader"/> pattern.
/// </summary>
public class ShortlistedCandidateReader : IShortlistedCandidateReader
{
    private readonly IMediator _mediator;

    public ShortlistedCandidateReader(IMediator mediator) => _mediator = mediator;

    public async Task<IReadOnlyList<ShortlistedCandidateDto>> GetShortlistedAsync(
        Guid? jobPostingId,
        CancellationToken cancellationToken = default)
    {
        var applications = await _mediator.Send(
            new SearchApplicationsQuery(
                Stage: ApplicationStage.Shortlisted,
                JobPostingId: jobPostingId),
            cancellationToken);

        // HasInterviewScheduled is Interview-owned state and is filled in by the query handler.
        return applications
            .Select(a => new ShortlistedCandidateDto(
                a.Id,
                a.CandidateProfileId,
                a.JobPostingId,
                a.AiMatchScore,
                a.AppliedAt,
                HasInterviewScheduled: false))
            .ToList();
    }
}
