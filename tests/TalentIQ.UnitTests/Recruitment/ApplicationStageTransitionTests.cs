using FluentAssertions;
using Recruitment.Domain.Entities;
using Recruitment.Domain.Exceptions;
using Recruitment.Domain.States;
using Xunit;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace TalentIQ.UnitTests.Recruitment;

/// <summary>
/// Verifies the State pattern rules governing application stage transitions.
/// </summary>
public class ApplicationStageTransitionTests
{
    private static ApplicationEntity NewApplication() =>
        ApplicationEntity.Submit(Guid.NewGuid(), Guid.NewGuid());

    // ---- Valid transitions ----

    [Theory]
    [InlineData(ApplicationStage.Applied, ApplicationStage.Screening)]
    [InlineData(ApplicationStage.Screening, ApplicationStage.Shortlisted)]
    [InlineData(ApplicationStage.Shortlisted, ApplicationStage.InterviewScheduled)]
    [InlineData(ApplicationStage.InterviewScheduled, ApplicationStage.Interviewed)]
    [InlineData(ApplicationStage.Interviewed, ApplicationStage.Offered)]
    [InlineData(ApplicationStage.Offered, ApplicationStage.Hired)]
    [InlineData(ApplicationStage.Applied, ApplicationStage.Rejected)]
    [InlineData(ApplicationStage.Interviewed, ApplicationStage.Rejected)]
    public void CanTransitionTo_ValidTransitions_ReturnsTrue(ApplicationStage from, ApplicationStage to)
    {
        ApplicationStageStateFactory.For(from).CanTransitionTo(to).Should().BeTrue();
    }

    // ---- Invalid transitions ----

    [Theory]
    [InlineData(ApplicationStage.Applied, ApplicationStage.Hired)]
    [InlineData(ApplicationStage.Applied, ApplicationStage.Interviewed)]
    [InlineData(ApplicationStage.Screening, ApplicationStage.Hired)]
    [InlineData(ApplicationStage.Hired, ApplicationStage.Applied)]
    [InlineData(ApplicationStage.Rejected, ApplicationStage.Applied)]
    [InlineData(ApplicationStage.Rejected, ApplicationStage.Screening)]
    [InlineData(ApplicationStage.Offered, ApplicationStage.Screening)]
    public void CanTransitionTo_InvalidTransitions_ReturnsFalse(ApplicationStage from, ApplicationStage to)
    {
        ApplicationStageStateFactory.For(from).CanTransitionTo(to).Should().BeFalse();
    }

    [Fact]
    public void AdvanceTo_ValidTransition_UpdatesStageAndRecordsHistory()
    {
        var application = NewApplication();

        application.AdvanceTo(ApplicationStage.Screening);

        application.Stage.Should().Be(ApplicationStage.Screening);
        application.StageHistory.Should().ContainSingle();
        var history = application.StageHistory.Single();
        history.FromStage.Should().Be(ApplicationStage.Applied);
        history.ToStage.Should().Be(ApplicationStage.Screening);
    }

    [Fact]
    public void AdvanceTo_InvalidTransition_ThrowsAndLeavesStateUnchanged()
    {
        var application = NewApplication(); // Applied

        var act = () => application.AdvanceTo(ApplicationStage.Hired);

        act.Should().Throw<InvalidStageTransitionException>();
        application.Stage.Should().Be(ApplicationStage.Applied);
        application.StageHistory.Should().BeEmpty();
    }

    [Fact]
    public void AdvanceTo_FromTerminalStage_IsRejected()
    {
        var application = NewApplication();
        application.AdvanceTo(ApplicationStage.Rejected);

        var act = () => application.AdvanceTo(ApplicationStage.Applied);

        act.Should().Throw<InvalidStageTransitionException>();
    }

    [Fact]
    public void FullHappyPath_AppliedToHired_ProducesOrderedHistory()
    {
        var application = NewApplication();

        application.AdvanceTo(ApplicationStage.Screening);
        application.AdvanceTo(ApplicationStage.Shortlisted);
        application.AdvanceTo(ApplicationStage.InterviewScheduled);
        application.AdvanceTo(ApplicationStage.Interviewed);
        application.AdvanceTo(ApplicationStage.Offered);
        application.AdvanceTo(ApplicationStage.Hired);

        application.Stage.Should().Be(ApplicationStage.Hired);
        application.StageHistory.Should().HaveCount(6);
        application.IsActive.Should().BeFalse();
    }

    [Theory]
    [InlineData(ApplicationStage.Hired)]
    [InlineData(ApplicationStage.Rejected)]
    public void TerminalStates_AreTerminal(ApplicationStage stage)
    {
        ApplicationStageStateFactory.For(stage).IsTerminal.Should().BeTrue();
    }
}
