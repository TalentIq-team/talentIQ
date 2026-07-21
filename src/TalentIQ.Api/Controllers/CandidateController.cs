using Candidate.Application.Candidates.Commands.CreateCandidateProfile;
using Candidate.Application.Candidates.Commands.UpdateCandidateProfile;
using Candidate.Application.Candidates.Commands.UploadResume;
using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Candidates.Queries.GetCandidateProfileById;
using Candidate.Application.Candidates.Queries.SearchCandidates;
using Candidate.Application.Common.Interfaces;
using Candidate.Application.Common.Models;
using Candidate.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Application.JobPostings.Queries.GetRecommendedJobs;
using TalentIQ.Api.Extensions;

namespace TalentIQ.Api.Controllers;

/// <summary>Candidate profile management, section CRUD, and resume upload.</summary>
[ApiController]
[Authorize]
[Route("api/v1/candidates")]
[Produces("application/json")]
public class CandidateController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICandidateDbContext _db;

    public CandidateController(IMediator mediator, ICandidateDbContext db)
    {
        _mediator = mediator;
        _db = db;
    }

    /// <summary>Create the current user's candidate profile.</summary>
    [HttpPost("profile")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateProfile([FromBody] CreateCandidateProfileRequest request, CancellationToken ct)
    {
        var userId = User.GetUserId();
        var command = new CreateCandidateProfileCommand(
            userId == Guid.Empty ? request.UserId : userId,
            request.ProfessionalSummary,
            request.YearsOfExperience,
            request.Skills ?? Array.Empty<SkillAssignmentInput>());

        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetProfile), new { id = result.Id }, result);
    }

    /// <summary>View a candidate profile by id.</summary>
    [HttpGet("profile/{id:guid}")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Update a candidate profile details, preferences, and privacy.</summary>
    [HttpPut("profile/{id:guid}")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateCandidateProfileRequest request, CancellationToken ct)
    {
        var command = new UpdateCandidateProfileCommand(
            id,
            request.ProfessionalSummary,
            request.YearsOfExperience,
            request.Skills ?? Array.Empty<SkillAssignmentInput>(),
            request.PreferredName,
            request.ProfilePictureUrl,
            request.DateOfBirth,
            request.Gender,
            request.Nationality,
            request.Address,
            request.City,
            request.Country,
            request.PostalCode,
            request.TimeZone,
            request.Headline,
            request.CurrentJobTitle,
            request.CurrentCompany,
            request.LinkedInUrl,
            request.GitHubUrl,
            request.PortfolioUrl,
            request.StackOverflowUrl,
            request.BehanceUrl,
            request.MediumUrl,
            request.TwitterUrl,
            request.PreferredJobTitles,
            request.PreferredLocations,
            request.ExpectedSalary,
            request.Currency,
            request.EmploymentTypePreference,
            request.WorkMode,
            request.NoticePeriod,
            request.WillingToRelocate,
            request.OpenToOpportunities,
            request.AllowRecruiterSearch,
            request.ShowEmail,
            request.ShowPhone,
            request.ShowResume,
            request.ReceiveEmails,
            request.ReceiveSms,
            request.TalentPoolConsent,
            request.AllowAiAnalysis);

        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Recruiter candidate search (FR-RC-02): filter candidates by skill and minimum experience.</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IReadOnlyList<CandidateProfileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? skill,
        [FromQuery] Guid? skillId,
        [FromQuery] decimal? minExperience,
        CancellationToken ct)
        => Ok(await _mediator.Send(new SearchCandidatesQuery(skill, skillId, minExperience), ct));

    /// <summary>AI job recommendations (FR-CD-06): jobs ranked by skill overlap with this profile.</summary>
    [HttpGet("{id:guid}/recommended-jobs")]
    [ProducesResponseType(typeof(IReadOnlyList<JobRecommendationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecommendedJobs(Guid id, CancellationToken ct)
    {
        var profile = await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct);
        var skillIds = profile.Skills.Select(s => s.SkillId).ToList();
        var recommendations = await _mediator.Send(new GetRecommendedJobsQuery(skillIds), ct);
        return Ok(recommendations);
    }

    /// <summary>Upload a resume (PDF/DOCX, max 5 MB) to Blob Storage; only the URL is persisted.</summary>
    [HttpPost("resume")]
    [ProducesResponseType(typeof(CandidateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadResume([FromForm] Guid candidateProfileId, IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { title = "A resume file is required." });
        }

        await using var stream = file.OpenReadStream();
        var upload = new ResumeUpload
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
            Content = stream
        };

        var result = await _mediator.Send(new UploadResumeCommand(candidateProfileId, upload), ct);
        return Ok(result);
    }

    // --- Work Experience CRUD ---
    [HttpPost("profile/{id:guid}/experiences")]
    public async Task<IActionResult> AddExperience(Guid id, [FromBody] AddExperienceRequest req, CancellationToken ct)
    {
        var exp = new CandidateExperience(id, req.Company, req.JobTitle, req.EmploymentType ?? "Full-time", req.Location ?? "", req.StartDate, req.EndDate, req.CurrentlyWorking, req.Responsibilities ?? "", req.Achievements ?? "", req.TechnologiesUsed ?? "");
        _db.CandidateExperiences.Add(exp);
        await _db.SaveChangesAsync(ct);
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    [HttpDelete("profile/{id:guid}/experiences/{expId:guid}")]
    public async Task<IActionResult> DeleteExperience(Guid id, Guid expId, CancellationToken ct)
    {
        var item = await _db.CandidateExperiences.FirstOrDefaultAsync(x => x.Id == expId && x.CandidateProfileId == id, ct);
        if (item != null) { _db.CandidateExperiences.Remove(item); await _db.SaveChangesAsync(ct); }
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    // --- Education CRUD ---
    [HttpPost("profile/{id:guid}/educations")]
    public async Task<IActionResult> AddEducation(Guid id, [FromBody] AddEducationRequest req, CancellationToken ct)
    {
        var edu = new CandidateEducation(id, req.Institution, req.Degree, req.FieldOfStudy ?? "", req.GPA ?? "", req.StartDate, req.EndDate, req.Description ?? "");
        _db.CandidateEducations.Add(edu);
        await _db.SaveChangesAsync(ct);
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    [HttpDelete("profile/{id:guid}/educations/{eduId:guid}")]
    public async Task<IActionResult> DeleteEducation(Guid id, Guid eduId, CancellationToken ct)
    {
        var item = await _db.CandidateEducations.FirstOrDefaultAsync(x => x.Id == eduId && x.CandidateProfileId == id, ct);
        if (item != null) { _db.CandidateEducations.Remove(item); await _db.SaveChangesAsync(ct); }
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    // --- Projects CRUD ---
    [HttpPost("profile/{id:guid}/projects")]
    public async Task<IActionResult> AddProject(Guid id, [FromBody] AddProjectRequest req, CancellationToken ct)
    {
        var proj = new CandidateProject(id, req.ProjectName, req.Description ?? "", req.Role ?? "", req.Technologies ?? "", req.GitHubUrl ?? "", req.LiveDemoUrl ?? "", req.StartDate, req.EndDate);
        _db.CandidateProjects.Add(proj);
        await _db.SaveChangesAsync(ct);
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    [HttpDelete("profile/{id:guid}/projects/{projId:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id, Guid projId, CancellationToken ct)
    {
        var item = await _db.CandidateProjects.FirstOrDefaultAsync(x => x.Id == projId && x.CandidateProfileId == id, ct);
        if (item != null) { _db.CandidateProjects.Remove(item); await _db.SaveChangesAsync(ct); }
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    // --- Certifications CRUD ---
    [HttpPost("profile/{id:guid}/certifications")]
    public async Task<IActionResult> AddCertification(Guid id, [FromBody] AddCertificationRequest req, CancellationToken ct)
    {
        var cert = new CandidateCertification(id, req.Name, req.Organization, req.IssueDate, req.ExpiryDate, req.CredentialId ?? "", req.CredentialUrl ?? "");
        _db.CandidateCertifications.Add(cert);
        await _db.SaveChangesAsync(ct);
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    [HttpDelete("profile/{id:guid}/certifications/{certId:guid}")]
    public async Task<IActionResult> DeleteCertification(Guid id, Guid certId, CancellationToken ct)
    {
        var item = await _db.CandidateCertifications.FirstOrDefaultAsync(x => x.Id == certId && x.CandidateProfileId == id, ct);
        if (item != null) { _db.CandidateCertifications.Remove(item); await _db.SaveChangesAsync(ct); }
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    // --- Languages CRUD ---
    [HttpPost("profile/{id:guid}/languages")]
    public async Task<IActionResult> AddLanguage(Guid id, [FromBody] AddLanguageRequest req, CancellationToken ct)
    {
        var lang = new CandidateLanguage(id, req.Language, req.ReadingLevel ?? "Native", req.WritingLevel ?? "Native", req.SpeakingLevel ?? "Native");
        _db.CandidateLanguages.Add(lang);
        await _db.SaveChangesAsync(ct);
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    [HttpDelete("profile/{id:guid}/languages/{langId:guid}")]
    public async Task<IActionResult> DeleteLanguage(Guid id, Guid langId, CancellationToken ct)
    {
        var item = await _db.CandidateLanguages.FirstOrDefaultAsync(x => x.Id == langId && x.CandidateProfileId == id, ct);
        if (item != null) { _db.CandidateLanguages.Remove(item); await _db.SaveChangesAsync(ct); }
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    // --- Achievements CRUD ---
    [HttpPost("profile/{id:guid}/achievements")]
    public async Task<IActionResult> AddAchievement(Guid id, [FromBody] AddAchievementRequest req, CancellationToken ct)
    {
        var ach = new CandidateAchievement(id, req.Title, req.Description ?? "", req.IssuedBy ?? "", req.AwardDate);
        _db.CandidateAchievements.Add(ach);
        await _db.SaveChangesAsync(ct);
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }

    [HttpDelete("profile/{id:guid}/achievements/{achId:guid}")]
    public async Task<IActionResult> DeleteAchievement(Guid id, Guid achId, CancellationToken ct)
    {
        var item = await _db.CandidateAchievements.FirstOrDefaultAsync(x => x.Id == achId && x.CandidateProfileId == id, ct);
        if (item != null) { _db.CandidateAchievements.Remove(item); await _db.SaveChangesAsync(ct); }
        return Ok(await _mediator.Send(new GetCandidateProfileByIdQuery(id), ct));
    }
}

public record CreateCandidateProfileRequest(
    Guid UserId,
    string ProfessionalSummary,
    decimal YearsOfExperience,
    IReadOnlyList<SkillAssignmentInput>? Skills);

public record UpdateCandidateProfileRequest(
    string ProfessionalSummary,
    decimal YearsOfExperience,
    IReadOnlyList<SkillAssignmentInput>? Skills = null,
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
    string? Headline = null,
    string? CurrentJobTitle = null,
    string? CurrentCompany = null,
    string? LinkedInUrl = null,
    string? GitHubUrl = null,
    string? PortfolioUrl = null,
    string? StackOverflowUrl = null,
    string? BehanceUrl = null,
    string? MediumUrl = null,
    string? TwitterUrl = null,
    string? PreferredJobTitles = null,
    string? PreferredLocations = null,
    decimal? ExpectedSalary = null,
    string Currency = "USD",
    string? EmploymentTypePreference = null,
    string WorkMode = "Hybrid",
    string NoticePeriod = "30 Days",
    bool WillingToRelocate = true,
    bool OpenToOpportunities = true,
    bool AllowRecruiterSearch = true,
    bool ShowEmail = true,
    bool ShowPhone = true,
    bool ShowResume = true,
    bool ReceiveEmails = true,
    bool ReceiveSms = false,
    bool TalentPoolConsent = true,
    bool AllowAiAnalysis = true);

public record AddExperienceRequest(string Company, string JobTitle, string? EmploymentType, string? Location, DateTime StartDate, DateTime? EndDate, bool CurrentlyWorking, string? Responsibilities, string? Achievements, string? TechnologiesUsed);
public record AddEducationRequest(string Institution, string Degree, string? FieldOfStudy, string? GPA, DateTime StartDate, DateTime? EndDate, string? Description);
public record AddProjectRequest(string ProjectName, string? Description, string? Role, string? Technologies, string? GitHubUrl, string? LiveDemoUrl, DateTime? StartDate, DateTime? EndDate);
public record AddCertificationRequest(string Name, string Organization, DateTime IssueDate, DateTime? ExpiryDate, string? CredentialId, string? CredentialUrl);
public record AddLanguageRequest(string Language, string? ReadingLevel, string? WritingLevel, string? SpeakingLevel);
public record AddAchievementRequest(string Title, string? Description, string? IssuedBy, DateTime AwardDate);
