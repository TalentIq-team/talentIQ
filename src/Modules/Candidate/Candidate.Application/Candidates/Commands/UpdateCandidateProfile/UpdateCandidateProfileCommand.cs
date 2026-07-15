using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Common.Interfaces;
using Candidate.Application.Common.Models;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Candidate.Application.Candidates.Commands.UpdateCandidateProfile;

/// <summary>FR-CD-01: update an existing candidate profile (with skills and proficiency levels).</summary>
public record UpdateCandidateProfileCommand(
    Guid Id,
    string ProfessionalSummary,
    decimal YearsOfExperience,
    IReadOnlyList<SkillAssignmentInput> Skills) : IRequest<CandidateProfileDto>;

public class UpdateCandidateProfileCommandValidator : AbstractValidator<UpdateCandidateProfileCommand>
{
    public UpdateCandidateProfileCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ProfessionalSummary).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.YearsOfExperience).GreaterThanOrEqualTo(0).LessThanOrEqualTo(80);
        RuleForEach(x => x.Skills).SetValidator(new SkillAssignmentInputValidator());
    }
}

public class UpdateCandidateProfileCommandHandler
    : IRequestHandler<UpdateCandidateProfileCommand, CandidateProfileDto>
{
    private readonly ICandidateDbContext _db;

    public UpdateCandidateProfileCommandHandler(ICandidateDbContext db) => _db = db;

    public async Task<CandidateProfileDto> Handle(UpdateCandidateProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await _db.CandidateProfiles
            .Include(p => p.Skills)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.CandidateProfile), request.Id);

        profile.UpdateDetails(request.ProfessionalSummary, request.YearsOfExperience);
        profile.ReplaceSkills((request.Skills ?? Array.Empty<SkillAssignmentInput>()).Select(s => s.ToAssignment()));

        await _db.SaveChangesAsync(cancellationToken);

        return CandidateProfileDto.FromEntity(profile);
    }
}
