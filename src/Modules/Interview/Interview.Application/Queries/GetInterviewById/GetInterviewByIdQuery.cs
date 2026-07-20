using Interview.Application.DTOs;
using Interview.Application.Interfaces;
using MediatR;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Interview.Application.Queries.GetInterviewById;

/// <summary>Loads a single interview plus its evaluation for the evaluation page.</summary>
public record GetInterviewByIdQuery(Guid InterviewId) : IRequest<InterviewDetailDto>;

public class GetInterviewByIdQueryHandler : IRequestHandler<GetInterviewByIdQuery, InterviewDetailDto>
{
    private readonly IInterviewRepository _repository;

    public GetInterviewByIdQueryHandler(IInterviewRepository repository)
    {
        _repository = repository;
    }

    public async Task<InterviewDetailDto> Handle(GetInterviewByIdQuery request, CancellationToken cancellationToken)
    {
        var interview = await _repository.GetInterviewByIdAsync(request.InterviewId)
            ?? throw new NotFoundException($"Interview '{request.InterviewId}' was not found.");

        var evaluation = await _repository.GetEvaluationByInterviewIdAsync(request.InterviewId);

        return InterviewDetailDto.FromEntity(interview, evaluation);
    }
}
