using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;
using Recruitment.Infrastructure.Analysis;
using Recruitment.Infrastructure.Persistence;
using Xunit;

namespace TalentIQ.UnitTests.Recruitment;

/// <summary>FR-RC-05: deterministic skill-overlap fallback scoring.</summary>
public class SkillOverlapResumeAnalyzerTests
{
    private sealed class FakeCandidateSkillReader : ICandidateSkillReader
    {
        private readonly IReadOnlyList<Guid> _skills;
        public FakeCandidateSkillReader(IReadOnlyList<Guid> skills) => _skills = skills;
        public Task<IReadOnlyList<Guid>> GetSkillIdsAsync(Guid candidateProfileId, CancellationToken cancellationToken = default)
            => Task.FromResult(_skills);
    }

    private static RecruitmentDbContext NewContext() =>
        new(new DbContextOptionsBuilder<RecruitmentDbContext>()
            .UseInMemoryDatabase($"recruitment-{Guid.NewGuid()}")
            .Options);

    private static async Task<JobPosting> SeedJobWithSkills(RecruitmentDbContext db, params Guid[] skillIds)
    {
        var job = JobPosting.Create(Guid.NewGuid(), Guid.NewGuid(), "Engineer", "d", "Remote", EmploymentType.FullTime, 2);
        job.ReplaceSkills(skillIds);
        job.Publish();
        db.JobPostings.Add(job);
        await db.SaveChangesAsync();
        return job;
    }

    [Fact]
    public async Task Scores_By_Overlap_And_Reports_Matched_And_Missing()
    {
        var skill1 = Guid.NewGuid();
        var skill2 = Guid.NewGuid();
        var skill3 = Guid.NewGuid();
        var skill4 = Guid.NewGuid();

        await using var db = NewContext();
        var job = await SeedJobWithSkills(db, skill1, skill2, skill3, skill4);

        // Candidate has 2 of the 4 required skills → 50%.
        var reader = new FakeCandidateSkillReader(new[] { skill1, skill2, Guid.NewGuid() });
        var analyzer = new SkillOverlapResumeAnalyzer(db, reader);

        var result = await analyzer.AnalyzeAsync(job.Id, Guid.NewGuid());

        result.MatchScore.Should().Be(50m);
        result.MatchedSkillIds.Should().BeEquivalentTo(new[] { skill1, skill2 });
        result.MissingSkillIds.Should().BeEquivalentTo(new[] { skill3, skill4 });
        result.Explanation.Should().Contain("Matched 2 of 4");
    }

    [Fact]
    public async Task NoRequiredSkills_ReturnsZeroScore()
    {
        await using var db = NewContext();
        var job = await SeedJobWithSkills(db); // no skills

        var analyzer = new SkillOverlapResumeAnalyzer(db, new FakeCandidateSkillReader(new[] { Guid.NewGuid() }));
        var result = await analyzer.AnalyzeAsync(job.Id, Guid.NewGuid());

        result.MatchScore.Should().Be(0m);
        result.MatchedSkillIds.Should().BeEmpty();
    }
}
