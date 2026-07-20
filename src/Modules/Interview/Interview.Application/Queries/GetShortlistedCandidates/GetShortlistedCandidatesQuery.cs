using Interview.Application.DTOs;
using Interview.Application.Interfaces;
using MediatR;

namespace Interview.Application.Queries.GetShortlistedCandidates;

/// <summary>
/// Hiring-manager shortlist view. Shortlisted candidates are owned by the Recruitment module and
/// read through <see cref="IShortlistedCandidateReader"/>; this handler only enriches them with
/// Interview-owned state (whether an interview already exists).
/// </summary>
public record GetShortlistedCandidatesQuery(Guid? JobPostingId = null)
    : IRequest<IReadOnlyList<ShortlistedCandidateDto>>;

public class GetShortlistedCandidatesQueryHandler
    : IRequestHandler<GetShortlistedCandidatesQuery, IReadOnlyList<ShortlistedCandidateDto>>
{
    private readonly IShortlistedCandidateReader _reader;
    private readonly IInterviewRepository _repository;

    public GetShortlistedCandidatesQueryHandler(
        IShortlistedCandidateReader reader,
        IInterviewRepository repository)
    {
        _reader = reader;
        _repository = repository;
    }

    public async Task<IReadOnlyList<ShortlistedCandidateDto>> Handle(
        GetShortlistedCandidatesQuery request,
        CancellationToken cancellationToken)
    {
        var shortlisted = await _reader.GetShortlistedAsync(request.JobPostingId, cancellationToken);

        var scheduled = (await _repository.GetScheduledApplicationIdsAsync()).ToHashSet();

        return shortlisted
            .Select(c => c with { HasInterviewScheduled = scheduled.Contains(c.ApplicationId) })
            .OrderByDescending(c => c.AiMatchScore ?? 0)
            .ToList();
    }
}
