using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;

namespace Recruitment.Infrastructure.Analysis;

/// <summary>
/// FR-RC-05 fallback analyzer: deterministic skill-overlap scoring used when no external AI
/// service (e.g. Gemini) is configured. Score = matched required skills / total required skills.
/// This is NOT a fake ML model — it is an explainable, rule-based baseline behind the same
/// <see cref="IResumeAnalyzer"/> seam a real AI implementation would use.
/// </summary>
public class SkillOverlapResumeAnalyzer : IResumeAnalyzer
{
    private readonly IRecruitmentDbContext _db;
    private readonly ICandidateSkillReader _candidateSkills;

    public SkillOverlapResumeAnalyzer(IRecruitmentDbContext db, ICandidateSkillReader candidateSkills)
    {
        _db = db;
        _candidateSkills = candidateSkills;
    }

    public async Task<ResumeAnalysisResult> AnalyzeAsync(Guid jobPostingId, Guid candidateProfileId, CancellationToken cancellationToken = default)
    {
        var requiredSkills = await _db.JobPostingSkills
            .AsNoTracking()
            .Where(s => s.JobPostingId == jobPostingId)
            .Select(s => s.SkillId)
            .ToListAsync(cancellationToken);

        var candidateSkills = (await _candidateSkills.GetSkillIdsAsync(candidateProfileId, cancellationToken)).ToHashSet();

        if (requiredSkills.Count == 0)
        {
            return new ResumeAnalysisResult(
                0m,
                Array.Empty<Guid>(),
                Array.Empty<Guid>(),
                "The job posting lists no required skills, so no skill-based match score could be computed.");
        }

        var matched = requiredSkills.Where(candidateSkills.Contains).Distinct().ToList();
        var missing = requiredSkills.Where(s => !candidateSkills.Contains(s)).Distinct().ToList();

        var score = Math.Round(matched.Count * 100m / requiredSkills.Count, 2);
        var explanation =
            $"Matched {matched.Count} of {requiredSkills.Count} required skills " +
            $"({score}% overlap). Missing {missing.Count} required skill(s). " +
            "Score computed by deterministic skill overlap (AI service not configured).";

        return new ResumeAnalysisResult(score, matched, missing, explanation);
    }
}
