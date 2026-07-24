using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Common.Interfaces;
using Candidate.Application.Common.Models;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Candidate.Application.Candidates.Commands.UpdateCandidateProfile;

/// <summary>FR-CD-01: update an existing candidate profile (with skills, section details and settings).</summary>
public record UpdateCandidateProfileCommand(
    Guid Id,
    string ProfessionalSummary,
    decimal YearsOfExperience,
    IReadOnlyList<SkillAssignmentInput>? Skills = null,
    // --- Personal Info ---
    string? PreferredName = null,
    string? ProfilePictureUrl = null,
    DateTime? DateOfBirth = null,
    string? Gender = null,
    string? Nationality = null,
    string? Address = null,
    string? City = null,
    string? Country = null,
    string? PostalCode = null,
    string? TimeZone = null,
    // --- Professional Info ---
    string? Headline = null,
    string? CurrentJobTitle = null,
    string? CurrentCompany = null,
    // --- Social Links ---
    string? LinkedInUrl = null,
    string? GitHubUrl = null,
    string? PortfolioUrl = null,
    string? StackOverflowUrl = null,
    string? BehanceUrl = null,
    string? MediumUrl = null,
    string? TwitterUrl = null,
    // --- Job Preferences ---
    string? PreferredJobTitles = null,
    string? PreferredLocations = null,
    decimal? ExpectedSalary = null,
    string Currency = "USD",
    string? EmploymentTypePreference = null,
    string WorkMode = "Hybrid",
    string NoticePeriod = "30 Days",
    bool WillingToRelocate = true,
    bool OpenToOpportunities = true,
    // --- Privacy Settings ---
    bool AllowRecruiterSearch = true,
    bool ShowEmail = true,
    bool ShowPhone = true,
    bool ShowResume = true,
    bool ReceiveEmails = true,
    bool ReceiveSms = false,
    bool TalentPoolConsent = true,
    bool AllowAiAnalysis = true
) : IRequest<CandidateProfileDto>;

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
            .Include(p => p.Skills).ThenInclude(s => s.Skill)
            .Include(p => p.Experiences)
            .Include(p => p.Educations)
            .Include(p => p.Projects)
            .Include(p => p.Certifications)
            .Include(p => p.Languages)
            .Include(p => p.Achievements)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.CandidateProfile), request.Id);

        profile.UpdateProfessionalInfo(request.Headline, request.CurrentJobTitle, request.CurrentCompany, request.ProfessionalSummary, request.YearsOfExperience);

        profile.UpdatePersonalInfo(
            request.PreferredName,
            request.ProfilePictureUrl,
            request.DateOfBirth,
            request.Gender,
            request.Nationality,
            request.Address,
            request.City,
            request.Country,
            request.PostalCode,
            request.TimeZone);

        profile.UpdateSocialLinks(
            request.LinkedInUrl,
            request.GitHubUrl,
            request.PortfolioUrl,
            request.StackOverflowUrl,
            request.BehanceUrl,
            request.MediumUrl,
            request.TwitterUrl);

        profile.UpdateJobPreferences(
            request.PreferredJobTitles,
            request.PreferredLocations,
            request.ExpectedSalary,
            request.Currency,
            request.EmploymentTypePreference,
            request.WorkMode,
            request.NoticePeriod,
            request.WillingToRelocate,
            request.OpenToOpportunities);

        profile.UpdatePrivacySettings(
            request.AllowRecruiterSearch,
            request.ShowEmail,
            request.ShowPhone,
            request.ShowResume,
            request.ReceiveEmails,
            request.ReceiveSms,
            request.TalentPoolConsent,
            request.AllowAiAnalysis);

        if (request.Skills != null)
        {
            profile.ReplaceSkills(request.Skills.Select(s => s.ToAssignment()));
        }

        await _db.SaveChangesAsync(cancellationToken);

        return CandidateProfileDto.FromEntity(profile);
    }
}
