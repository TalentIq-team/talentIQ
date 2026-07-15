using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Common;
using Candidate.Application.Common.Interfaces;
using Candidate.Application.Common.Models;
using Candidate.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Candidate.Application.Candidates.Commands.CreateCandidateProfile;

/// <summary>FR-CD-01: create a candidate profile (with skills and proficiency levels).</summary>
public record CreateCandidateProfileCommand(
    Guid UserId,
    string ProfessionalSummary,
    decimal YearsOfExperience,
    IReadOnlyList<SkillAssignmentInput> Skills) : IRequest<CandidateProfileDto>;

public class CreateCandidateProfileCommandValidator : AbstractValidator<CreateCandidateProfileCommand>
{
    public CreateCandidateProfileCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ProfessionalSummary).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.YearsOfExperience).GreaterThanOrEqualTo(0).LessThanOrEqualTo(80);
        RuleForEach(x => x.Skills).SetValidator(new SkillAssignmentInputValidator());
    }
}

public class CreateCandidateProfileCommandHandler
    : IRequestHandler<CreateCandidateProfileCommand, CandidateProfileDto>
{
    private readonly ICandidateDbContext _db;

    public CreateCandidateProfileCommandHandler(ICandidateDbContext db) => _db = db;

    public async Task<CandidateProfileDto> Handle(CreateCandidateProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = CandidateProfile.Create(request.UserId, request.ProfessionalSummary, request.YearsOfExperience);

        if (request.Skills is { Count: > 0 })
        {
            profile.ReplaceSkills(request.Skills.Select(s => s.ToAssignment()));
        }

        _db.CandidateProfiles.Add(profile);
        await _db.SaveChangesAsync(cancellationToken);

        // Reload navigation so the returned DTO reflects persisted skills.
        return CandidateProfileDto.FromEntity(profile);
    }
}
