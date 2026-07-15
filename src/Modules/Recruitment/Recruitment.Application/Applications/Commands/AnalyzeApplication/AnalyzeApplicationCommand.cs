using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace Recruitment.Application.Applications.Commands.AnalyzeApplication;

/// <summary>
/// FR-RC-05: run (or re-run) resume analysis for an application and persist the result.
/// Invoked automatically after submission and available as a manual recruiter trigger.
/// </summary>
public record AnalyzeApplicationCommand(Guid ApplicationId) : IRequest<ApplicationAnalysisDto>;

public class AnalyzeApplicationCommandHandler : IRequestHandler<AnalyzeApplicationCommand, ApplicationAnalysisDto>
{
    private readonly IRecruitmentDbContext _db;
    private readonly IResumeAnalyzer _analyzer;

    public AnalyzeApplicationCommandHandler(IRecruitmentDbContext db, IResumeAnalyzer analyzer)
    {
        _db = db;
        _analyzer = analyzer;
    }

    public async Task<ApplicationAnalysisDto> Handle(AnalyzeApplicationCommand request, CancellationToken cancellationToken)
    {
        var application = await _db.Applications
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, cancellationToken)
            ?? throw new NotFoundException(nameof(ApplicationEntity), request.ApplicationId);

        var result = await _analyzer.AnalyzeAsync(application.JobPostingId, application.CandidateProfileId, cancellationToken);

        var analysis = await _db.ApplicationAnalyses
            .FirstOrDefaultAsync(a => a.ApplicationId == application.Id, cancellationToken);

        if (analysis is null)
        {
            analysis = ApplicationAnalysis.Create(
                application.Id, result.MatchScore, result.MatchedSkillIds, result.MissingSkillIds, result.Explanation);
            _db.ApplicationAnalyses.Add(analysis);
        }
        else
        {
            analysis.Update(result.MatchScore, result.MatchedSkillIds, result.MissingSkillIds, result.Explanation);
        }

        application.SetAiMatchScore(result.MatchScore);
        await _db.SaveChangesAsync(cancellationToken);

        return ApplicationAnalysisDto.FromEntity(analysis);
    }
}
