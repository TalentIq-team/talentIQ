using Candidate.Domain.Entities;

namespace Candidate.Application.Candidates.Dtos;

public record CandidateSkillDto(
    Guid SkillId,
    string? SkillName,
    string? ProficiencyLevel,
    string? Category,
    decimal? YearsOfExperience,
    string? LastUsed)
{
    public static CandidateSkillDto FromEntity(CandidateSkill skill) =>
        new(skill.SkillId, skill.Skill?.Name ?? "Skill", skill.ProficiencyLevel, skill.Category, skill.YearsOfExperience, skill.LastUsed);
}

public record CandidateExperienceDto(
    Guid Id,
    string Company,
    string JobTitle,
    string EmploymentType,
    string Location,
    DateTime StartDate,
    DateTime? EndDate,
    bool CurrentlyWorking,
    string Responsibilities,
    string Achievements,
    string TechnologiesUsed)
{
    public static CandidateExperienceDto FromEntity(CandidateExperience e) =>
        new(e.Id, e.Company, e.JobTitle, e.EmploymentType, e.Location, e.StartDate, e.EndDate, e.CurrentlyWorking, e.Responsibilities, e.Achievements, e.TechnologiesUsed);
}

public record CandidateEducationDto(
    Guid Id,
    string Institution,
    string Degree,
    string FieldOfStudy,
    string GPA,
    DateTime StartDate,
    DateTime? EndDate,
    string Description)
{
    public static CandidateEducationDto FromEntity(CandidateEducation e) =>
        new(e.Id, e.Institution, e.Degree, e.FieldOfStudy, e.GPA, e.StartDate, e.EndDate, e.Description);
}

public record CandidateProjectDto(
    Guid Id,
    string ProjectName,
    string Description,
    string Role,
    string Technologies,
    string GitHubUrl,
    string LiveDemoUrl,
    DateTime? StartDate,
    DateTime? EndDate)
{
    public static CandidateProjectDto FromEntity(CandidateProject p) =>
        new(p.Id, p.ProjectName, p.Description, p.Role, p.Technologies, p.GitHubUrl, p.LiveDemoUrl, p.StartDate, p.EndDate);
}

public record CandidateCertificationDto(
    Guid Id,
    string Name,
    string Organization,
    DateTime IssueDate,
    DateTime? ExpiryDate,
    string CredentialId,
    string CredentialUrl)
{
    public static CandidateCertificationDto FromEntity(CandidateCertification c) =>
        new(c.Id, c.Name, c.Organization, c.IssueDate, c.ExpiryDate, c.CredentialId, c.CredentialUrl);
}

public record CandidateLanguageDto(
    Guid Id,
    string Language,
    string ReadingLevel,
    string WritingLevel,
    string SpeakingLevel)
{
    public static CandidateLanguageDto FromEntity(CandidateLanguage l) =>
        new(l.Id, l.Language, l.ReadingLevel, l.WritingLevel, l.SpeakingLevel);
}

public record CandidateAchievementDto(
    Guid Id,
    string Title,
    string Description,
    string IssuedBy,
    DateTime AwardDate)
{
    public static CandidateAchievementDto FromEntity(CandidateAchievement a) =>
        new(a.Id, a.Title, a.Description, a.IssuedBy, a.AwardDate);
}

public record CandidateDocumentDto(
    Guid Id,
    string DocumentType,
    string FileName,
    string BlobUrl,
    DateTime UploadedAt)
{
    public static CandidateDocumentDto FromEntity(CandidateDocument d) =>
        new(d.Id, d.DocumentType.ToString(), d.FileName, d.BlobUrl, d.UploadedAt);
}

public record CandidateProfileDto(
    Guid Id,
    Guid UserId,
    string ProfessionalSummary,
    string? ResumeBlobUrl,
    decimal YearsOfExperience,
    IReadOnlyList<CandidateSkillDto> Skills,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    // --- Enterprise Additions ---
    string? PreferredName = null,
    string? ProfilePictureUrl = null,
    string? CoverPictureUrl = null,
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
    bool AllowAiAnalysis = true,
    IReadOnlyList<CandidateExperienceDto>? Experiences = null,
    IReadOnlyList<CandidateEducationDto>? Educations = null,
    IReadOnlyList<CandidateProjectDto>? Projects = null,
    IReadOnlyList<CandidateCertificationDto>? Certifications = null,
    IReadOnlyList<CandidateLanguageDto>? Languages = null,
    IReadOnlyList<CandidateAchievementDto>? Achievements = null,
    IReadOnlyList<CandidateDocumentDto>? Documents = null,
    int ProfileCompletionPercentage = 0,
    IReadOnlyList<string>? MissingSectionSuggestions = null)
{
    public static CandidateProfileDto FromEntity(CandidateProfile profile)
    {
        var experiences = profile.Experiences?.Select(CandidateExperienceDto.FromEntity).ToList() ?? new List<CandidateExperienceDto>();
        var educations = profile.Educations?.Select(CandidateEducationDto.FromEntity).ToList() ?? new List<CandidateEducationDto>();
        var projects = profile.Projects?.Select(CandidateProjectDto.FromEntity).ToList() ?? new List<CandidateProjectDto>();
        var certifications = profile.Certifications?.Select(CandidateCertificationDto.FromEntity).ToList() ?? new List<CandidateCertificationDto>();
        var languages = profile.Languages?.Select(CandidateLanguageDto.FromEntity).ToList() ?? new List<CandidateLanguageDto>();
        var achievements = profile.Achievements?.Select(CandidateAchievementDto.FromEntity).ToList() ?? new List<CandidateAchievementDto>();
        var documents = profile.Documents?.Select(CandidateDocumentDto.FromEntity).ToList() ?? new List<CandidateDocumentDto>();

        // Calculate profile completion percentage
        var (completion, missing) = CalculateProfileCompletion(profile, experiences.Count, educations.Count, projects.Count, certifications.Count, languages.Count, achievements.Count);

        return new(
            profile.Id,
            profile.UserId,
            profile.ProfessionalSummary,
            profile.ResumeBlobUrl,
            profile.YearsOfExperience,
            profile.Skills?.Select(CandidateSkillDto.FromEntity).ToList() ?? new List<CandidateSkillDto>(),
            profile.CreatedAt,
            profile.UpdatedAt,
            profile.PreferredName,
            profile.ProfilePictureUrl,
            profile.CoverPictureUrl,
            profile.DateOfBirth,
            profile.Gender,
            profile.Nationality,
            profile.Address,
            profile.City,
            profile.Country,
            profile.PostalCode,
            profile.TimeZone,
            profile.Headline,
            profile.CurrentJobTitle,
            profile.CurrentCompany,
            profile.LinkedInUrl,
            profile.GitHubUrl,
            profile.PortfolioUrl,
            profile.StackOverflowUrl,
            profile.BehanceUrl,
            profile.MediumUrl,
            profile.TwitterUrl,
            profile.PreferredJobTitles,
            profile.PreferredLocations,
            profile.ExpectedSalary,
            profile.Currency,
            profile.EmploymentTypePreference,
            profile.WorkMode ?? "Hybrid",
            profile.NoticePeriod ?? "30 Days",
            profile.WillingToRelocate,
            profile.OpenToOpportunities,
            profile.AllowRecruiterSearch,
            profile.ShowEmail,
            profile.ShowPhone,
            profile.ShowResume,
            profile.ReceiveEmails,
            profile.ReceiveSms,
            profile.TalentPoolConsent,
            profile.AllowAiAnalysis,
            experiences,
            educations,
            projects,
            certifications,
            languages,
            achievements,
            documents,
            completion,
            missing);
    }

    private static (int score, List<string> missing) CalculateProfileCompletion(
        CandidateProfile p, int expCount, int eduCount, int projCount, int certCount, int langCount, int achCount)
    {
        int total = 0;
        var missing = new List<string>();

        if (!string.IsNullOrWhiteSpace(p.ProfessionalSummary)) total += 15;
        else missing.Add("Professional Summary");

        if (!string.IsNullOrWhiteSpace(p.Headline)) total += 10;
        else missing.Add("Headline & Current Job Title");

        if (p.Skills?.Count > 0) total += 15;
        else missing.Add("Skills");

        if (expCount > 0) total += 15;
        else missing.Add("Work Experience");

        if (eduCount > 0) total += 10;
        else missing.Add("Education");

        if (!string.IsNullOrWhiteSpace(p.ResumeBlobUrl)) total += 15;
        else missing.Add("Resume Upload");

        if (projCount > 0 || certCount > 0) total += 10;
        else missing.Add("Projects or Certifications");

        if (!string.IsNullOrWhiteSpace(p.LinkedInUrl) || !string.IsNullOrWhiteSpace(p.GitHubUrl) || !string.IsNullOrWhiteSpace(p.PortfolioUrl)) total += 5;
        else missing.Add("Social Links (LinkedIn / GitHub / Portfolio)");

        if (langCount > 0) total += 5;
        else missing.Add("Languages");

        return (Math.Min(100, total), missing);
    }
}
