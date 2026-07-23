using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;

namespace Recruitment.Application.Applications.Events;

/// <summary>
/// Simple skill-overlap AI match score: percentage of the job posting's required skills
/// that the candidate profile also has. Runs after ApplicationSubmittedEvent (FR-CD-04).
/// Uses ICandidateSkillReader (implemented in the composition root) to stay decoupled
/// from the Candidate module.
/// </summary>
public class ApplicationSubmittedEventHandler : INotificationHandler<ApplicationSubmittedEvent>
{
    private readonly IRecruitmentDbContext _db;
    private readonly ICandidateSkillReader _candidateSkillReader;

    public ApplicationSubmittedEventHandler(IRecruitmentDbContext db, ICandidateSkillReader candidateSkillReader)
    {
        _db = db;
        _candidateSkillReader = candidateSkillReader;
    }

    public async Task Handle(ApplicationSubmittedEvent notification, CancellationToken cancellationToken)
    {
        var jobSkillIds = await _db.JobPostingSkills
            .Where(js => js.JobPostingId == notification.JobPostingId)
            .Select(js => js.SkillId)
            .ToListAsync(cancellationToken);

        decimal score;
        if (jobSkillIds.Count == 0)
        {
            score = 0;
        }
        else
        {
            var candidateSkillIds = await _candidateSkillReader.GetSkillIdsAsync(notification.CandidateProfileId, cancellationToken);
            var matched = jobSkillIds.Count(id => candidateSkillIds.Contains(id));
            score = Math.Round((decimal)matched / jobSkillIds.Count * 100, 2);
        }

        var application = await _db.Applications
            .FirstOrDefaultAsync(a => a.Id == notification.ApplicationId, cancellationToken);

        if (application is not null)
        {
            application.SetAiMatchScore(score);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}