using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Queries.SearchApplications;
using Recruitment.Domain.Entities;
using Recruitment.Infrastructure.Persistence;
using Xunit;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace TalentIQ.UnitTests.Recruitment;

/// <summary>FR-RC-02: recruiter application search / filtering.</summary>
public class ApplicationSearchTests
{
    private static RecruitmentDbContext NewContext() =>
        new(new DbContextOptionsBuilder<RecruitmentDbContext>()
            .UseInMemoryDatabase($"recruitment-{Guid.NewGuid()}")
            .Options);

    private static ApplicationEntity ScoredApp(Guid jobId, decimal? score, ApplicationStage stage)
    {
        var app = ApplicationEntity.Submit(jobId, Guid.NewGuid());
        if (score is { } s)
        {
            app.SetAiMatchScore(s);
        }
        if (stage != ApplicationStage.Applied)
        {
            app.AdvanceTo(ApplicationStage.Screening);
        }
        return app;
    }

    [Fact]
    public async Task Filters_By_Stage_And_MinScore_And_Job()
    {
        await using var db = NewContext();
        var jobA = Guid.NewGuid();
        var jobB = Guid.NewGuid();

        db.Applications.Add(ScoredApp(jobA, 90, ApplicationStage.Screening));
        db.Applications.Add(ScoredApp(jobA, 50, ApplicationStage.Screening));
        db.Applications.Add(ScoredApp(jobA, 95, ApplicationStage.Applied));
        db.Applications.Add(ScoredApp(jobB, 99, ApplicationStage.Screening));
        await db.SaveChangesAsync();

        var handler = new SearchApplicationsQueryHandler(db);

        // Stage = Screening, job A, min score 80 → only the 90-scored screening app on job A.
        var results = await handler.Handle(
            new SearchApplicationsQuery(ApplicationStage.Screening, null, 80m, jobA),
            CancellationToken.None);

        results.Should().ContainSingle();
        results[0].AiMatchScore.Should().Be(90);
        results[0].Stage.Should().Be(ApplicationStage.Screening);
        results[0].JobPostingId.Should().Be(jobA);
    }

    [Fact]
    public async Task NoFilters_ReturnsAll_OrderedByScoreDesc()
    {
        await using var db = NewContext();
        var job = Guid.NewGuid();
        db.Applications.Add(ScoredApp(job, 40, ApplicationStage.Applied));
        db.Applications.Add(ScoredApp(job, 88, ApplicationStage.Applied));
        await db.SaveChangesAsync();

        var results = await new SearchApplicationsQueryHandler(db)
            .Handle(new SearchApplicationsQuery(), CancellationToken.None);

        results.Should().HaveCount(2);
        results[0].AiMatchScore.Should().Be(88); // highest score first
    }
}
