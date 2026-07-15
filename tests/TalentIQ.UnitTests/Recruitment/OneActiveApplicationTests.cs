using FluentAssertions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Recruitment.Application.Applications.Commands.SubmitApplication;
using Recruitment.Application.Applications.Events;
using Recruitment.Domain.Entities;
using Recruitment.Infrastructure.Persistence;
using TalentIQ.Shared.Kernel.Exceptions;
using Xunit;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace TalentIQ.UnitTests.Recruitment;

/// <summary>
/// Verifies FR-CD-04 business rule: one ACTIVE application per job per candidate.
/// </summary>
public class OneActiveApplicationTests
{
    private static RecruitmentDbContext NewContext() =>
        new(new DbContextOptionsBuilder<RecruitmentDbContext>()
            .UseInMemoryDatabase($"recruitment-{Guid.NewGuid()}")
            .Options);

    private static JobPosting PublishedJob()
    {
        var job = JobPosting.Create(Guid.NewGuid(), Guid.NewGuid(), "Backend Engineer", "desc", "Remote", EmploymentType.FullTime, 2);
        job.Publish();
        return job;
    }

    [Fact]
    public async Task Submit_FirstApplication_Succeeds()
    {
        await using var db = NewContext();
        var job = PublishedJob();
        db.JobPostings.Add(job);
        await db.SaveChangesAsync();

        var handler = new SubmitApplicationCommandHandler(db, Mock.Of<IPublisher>());

        var result = await handler.Handle(new SubmitApplicationCommand(job.Id, Guid.NewGuid()), CancellationToken.None);

        result.Stage.Should().Be(ApplicationStage.Applied);
        db.Applications.Should().ContainSingle();
    }

    [Fact]
    public async Task Submit_SecondActiveApplication_SameJobSameCandidate_Throws()
    {
        await using var db = NewContext();
        var job = PublishedJob();
        var candidateId = Guid.NewGuid();
        db.JobPostings.Add(job);
        db.Applications.Add(ApplicationEntity.Submit(job.Id, candidateId));
        await db.SaveChangesAsync();

        var handler = new SubmitApplicationCommandHandler(db, Mock.Of<IPublisher>());

        var act = () => handler.Handle(new SubmitApplicationCommand(job.Id, candidateId), CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task Submit_AfterPreviousRejected_Succeeds()
    {
        await using var db = NewContext();
        var job = PublishedJob();
        var candidateId = Guid.NewGuid();

        var rejected = ApplicationEntity.Submit(job.Id, candidateId);
        rejected.AdvanceTo(ApplicationStage.Rejected); // terminal → no longer active

        db.JobPostings.Add(job);
        db.Applications.Add(rejected);
        await db.SaveChangesAsync();

        var handler = new SubmitApplicationCommandHandler(db, Mock.Of<IPublisher>());

        var result = await handler.Handle(new SubmitApplicationCommand(job.Id, candidateId), CancellationToken.None);

        result.Should().NotBeNull();
        db.Applications.Count().Should().Be(2);
    }

    [Fact]
    public async Task Submit_ToUnpublishedJob_Throws()
    {
        await using var db = NewContext();
        var draftJob = JobPosting.Create(Guid.NewGuid(), Guid.NewGuid(), "Draft role", "d", "Remote", EmploymentType.FullTime, 0);
        db.JobPostings.Add(draftJob);
        await db.SaveChangesAsync();

        var handler = new SubmitApplicationCommandHandler(db, Mock.Of<IPublisher>());

        var act = () => handler.Handle(new SubmitApplicationCommand(draftJob.Id, Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task Submit_PublishesApplicationSubmittedEvent()
    {
        await using var db = NewContext();
        var job = PublishedJob();
        db.JobPostings.Add(job);
        await db.SaveChangesAsync();

        var publisher = new Mock<IPublisher>();
        var handler = new SubmitApplicationCommandHandler(db, publisher.Object);

        await handler.Handle(new SubmitApplicationCommand(job.Id, Guid.NewGuid()), CancellationToken.None);

        publisher.Verify(p => p.Publish(
            It.IsAny<ApplicationSubmittedEvent>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
