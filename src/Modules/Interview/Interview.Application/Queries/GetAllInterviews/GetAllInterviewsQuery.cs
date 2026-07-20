using Interview.Application.DTOs;
using Interview.Application.Interfaces;
using MediatR;

namespace Interview.Application.Queries.GetAllInterviews;

public record GetAllInterviewsQuery : IRequest<IReadOnlyList<InterviewSummaryDto>>;

public class GetAllInterviewsQueryHandler
    : IRequestHandler<GetAllInterviewsQuery, IReadOnlyList<InterviewSummaryDto>>
{
    private readonly IInterviewRepository _repository;

    public GetAllInterviewsQueryHandler(IInterviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<InterviewSummaryDto>> Handle(
        GetAllInterviewsQuery request,
        CancellationToken cancellationToken)
    {
        var interviews = await _repository.GetAllInterviewsAsync();

        return interviews
            .OrderBy(i => i.ScheduledStartTime)
            .Select(InterviewSummaryDto.FromEntity)
            .ToList();
    }
}
