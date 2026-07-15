using Candidate.Application.Candidates.Commands.CreateCandidateProfile;
using Candidate.Application.Candidates.Commands.UpdateCandidateProfile;
using Candidate.Application.Common;
using Candidate.Application.Common.Models;
using Candidate.Infrastructure.Persistence;
using FluentAssertions;
using FluentValidation.TestHelper;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace TalentIQ.UnitTests.Candidate;

/// <summary>FR-CD-01: candidate profiles carry skills WITH proficiency levels.</summary>
public class CandidateProfileProficiencyTests
{
    private static CandidateDbContext NewContext() =>
        new(new DbContextOptionsBuilder<CandidateDbContext>()
            .UseInMemoryDatabase($"candidate-{Guid.NewGuid()}")
            .Options);

    [Fact]
    public async Task Create_WithSkillProficiency_PersistsProficiency()
    {
        await using var db = NewContext();
        var handler = new CreateCandidateProfileCommandHandler(db);
        var skillId = Guid.NewGuid();

        var result = await handler.Handle(
            new CreateCandidateProfileCommand(
                Guid.NewGuid(),
                "Backend Developer",
                5,
                new[] { new SkillAssignmentInput(skillId, ProficiencyLevels.Advanced) }),
            CancellationToken.None);

        result.Skills.Should().ContainSingle();
        result.Skills[0].SkillId.Should().Be(skillId);
        result.Skills[0].ProficiencyLevel.Should().Be(ProficiencyLevels.Advanced);

        var persisted = await db.CandidateSkills.SingleAsync();
        persisted.ProficiencyLevel.Should().Be(ProficiencyLevels.Advanced);
    }

    [Fact]
    public async Task Update_ReplacesSkillsAndProficiency()
    {
        await using var db = NewContext();
        var skillA = Guid.NewGuid();
        var skillB = Guid.NewGuid();

        var created = await new CreateCandidateProfileCommandHandler(db).Handle(
            new CreateCandidateProfileCommand(Guid.NewGuid(), "Dev", 3,
                new[] { new SkillAssignmentInput(skillA, ProficiencyLevels.Beginner) }),
            CancellationToken.None);

        var updated = await new UpdateCandidateProfileCommandHandler(db).Handle(
            new UpdateCandidateProfileCommand(created.Id, "Senior Dev", 6,
                new[] { new SkillAssignmentInput(skillB, ProficiencyLevels.Expert) }),
            CancellationToken.None);

        updated.YearsOfExperience.Should().Be(6);
        updated.Skills.Should().ContainSingle();
        updated.Skills[0].SkillId.Should().Be(skillB);
        updated.Skills[0].ProficiencyLevel.Should().Be(ProficiencyLevels.Expert);
    }

    [Theory]
    [InlineData("Advanced", true)]
    [InlineData("expert", true)]      // case-insensitive
    [InlineData("Guru", false)]       // not an allowed value
    [InlineData("", false)]           // required
    public void Validator_EnforcesAllowedProficiencyValues(string proficiency, bool valid)
    {
        var validator = new SkillAssignmentInputValidator();
        var result = validator.TestValidate(new SkillAssignmentInput(Guid.NewGuid(), proficiency));

        if (valid)
        {
            result.ShouldNotHaveValidationErrorFor(x => x.ProficiencyLevel);
        }
        else
        {
            result.ShouldHaveValidationErrorFor(x => x.ProficiencyLevel);
        }
    }

    [Fact]
    public void Validator_RequiresSkillId()
    {
        var validator = new SkillAssignmentInputValidator();
        var result = validator.TestValidate(new SkillAssignmentInput(Guid.Empty, ProficiencyLevels.Advanced));
        result.ShouldHaveValidationErrorFor(x => x.SkillId);
    }
}
