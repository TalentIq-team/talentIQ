using Candidate.Domain.Exceptions;

namespace Candidate.Domain.Entities;

/// <summary>
/// Aggregate root representing an enterprise candidate's professional profile.
/// Owned by Member 3 (Candidate module).
/// </summary>
public class CandidateProfile
{
    private readonly List<CandidateSkill> _skills = new();
    private readonly List<CandidateExperience> _experiences = new();
    private readonly List<CandidateEducation> _educations = new();
    private readonly List<CandidateProject> _projects = new();
    private readonly List<CandidateCertification> _certifications = new();
    private readonly List<CandidateLanguage> _languages = new();
    private readonly List<CandidateAchievement> _achievements = new();
    private readonly List<CandidateDocument> _documents = new();

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }

    // --- Personal Information ---
    public string? PreferredName { get; private set; }
    public string? ProfilePictureUrl { get; private set; }
    public string? CoverPictureUrl { get; private set; }
    public DateTime? DateOfBirth { get; private set; }

    public string? Gender { get; private set; }
    public string? Nationality { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? Country { get; private set; }
    public string? PostalCode { get; private set; }
    public string? TimeZone { get; private set; }

    // --- Professional Information ---
    public string? Headline { get; private set; }
    public string? CurrentJobTitle { get; private set; }
    public string? CurrentCompany { get; private set; }
    public string ProfessionalSummary { get; private set; } = string.Empty;
    public decimal YearsOfExperience { get; private set; }
    public string? ResumeBlobUrl { get; private set; }

    // --- Social Links ---
    public string? LinkedInUrl { get; private set; }
    public string? GitHubUrl { get; private set; }
    public string? PortfolioUrl { get; private set; }
    public string? StackOverflowUrl { get; private set; }
    public string? BehanceUrl { get; private set; }
    public string? MediumUrl { get; private set; }
    public string? TwitterUrl { get; private set; }

    // --- Job Preferences ---
    public string? PreferredJobTitles { get; private set; }
    public string? PreferredLocations { get; private set; }
    public decimal? ExpectedSalary { get; private set; }
    public string Currency { get; private set; } = "USD";
    public string? EmploymentTypePreference { get; private set; }
    public string? WorkMode { get; private set; } = "Hybrid";
    public string? NoticePeriod { get; private set; } = "30 Days";
    public bool WillingToRelocate { get; private set; } = true;
    public bool OpenToOpportunities { get; private set; } = true;

    // --- Privacy Settings ---
    public bool AllowRecruiterSearch { get; private set; } = true;
    public bool ShowEmail { get; private set; } = true;
    public bool ShowPhone { get; private set; } = true;
    public bool ShowResume { get; private set; } = true;
    public bool ReceiveEmails { get; private set; } = true;
    public bool ReceiveSms { get; private set; } = false;
    public bool TalentPoolConsent { get; private set; } = true;
    public bool AllowAiAnalysis { get; private set; } = true;

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // --- Navigation Collections ---
    public IReadOnlyCollection<CandidateSkill> Skills => _skills.AsReadOnly();
    public IReadOnlyCollection<CandidateExperience> Experiences => _experiences.AsReadOnly();
    public IReadOnlyCollection<CandidateEducation> Educations => _educations.AsReadOnly();
    public IReadOnlyCollection<CandidateProject> Projects => _projects.AsReadOnly();
    public IReadOnlyCollection<CandidateCertification> Certifications => _certifications.AsReadOnly();
    public IReadOnlyCollection<CandidateLanguage> Languages => _languages.AsReadOnly();
    public IReadOnlyCollection<CandidateAchievement> Achievements => _achievements.AsReadOnly();
    public IReadOnlyCollection<CandidateDocument> Documents => _documents.AsReadOnly();

    // Required by EF Core.
    private CandidateProfile()
    {
    }

    public static CandidateProfile Create(
        Guid userId,
        string professionalSummary,
        decimal yearsOfExperience,
        string? preferredName = null,
        string? headline = null,
        string? currentJobTitle = null,
        string? currentCompany = null)
    {
        if (userId == Guid.Empty)
        {
            throw new CandidateDomainException("A candidate profile must belong to a valid user.");
        }

        Guard(professionalSummary, yearsOfExperience);

        var now = DateTime.UtcNow;
        return new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProfessionalSummary = professionalSummary.Trim(),
            YearsOfExperience = yearsOfExperience,
            PreferredName = preferredName,
            Headline = headline,
            CurrentJobTitle = currentJobTitle,
            CurrentCompany = currentCompany,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void UpdateDetails(string professionalSummary, decimal yearsOfExperience)
    {
        Guard(professionalSummary, yearsOfExperience);
        ProfessionalSummary = professionalSummary.Trim();
        YearsOfExperience = yearsOfExperience;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePersonalInfo(
        string? preferredName,
        string? profilePictureUrl,
        DateTime? dateOfBirth,
        string? gender,
        string? nationality,
        string? address,
        string? city,
        string? country,
        string? postalCode,
        string? timeZone)
    {
        PreferredName = preferredName?.Trim();
        ProfilePictureUrl = profilePictureUrl?.Trim();
        DateOfBirth = dateOfBirth;
        Gender = gender?.Trim();
        Nationality = nationality?.Trim();
        Address = address?.Trim();
        City = city?.Trim();
        Country = country?.Trim();
        PostalCode = postalCode?.Trim();
        TimeZone = timeZone?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateProfessionalInfo(
        string? headline,
        string? currentJobTitle,
        string? currentCompany,
        string professionalSummary,
        decimal yearsOfExperience)
    {
        Guard(professionalSummary, yearsOfExperience);
        Headline = headline?.Trim();
        CurrentJobTitle = currentJobTitle?.Trim();
        CurrentCompany = currentCompany?.Trim();
        ProfessionalSummary = professionalSummary.Trim();
        YearsOfExperience = yearsOfExperience;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateSocialLinks(
        string? linkedInUrl,
        string? gitHubUrl,
        string? portfolioUrl,
        string? stackOverflowUrl,
        string? behanceUrl,
        string? mediumUrl,
        string? twitterUrl)
    {
        LinkedInUrl = linkedInUrl?.Trim();
        GitHubUrl = gitHubUrl?.Trim();
        PortfolioUrl = portfolioUrl?.Trim();
        StackOverflowUrl = stackOverflowUrl?.Trim();
        BehanceUrl = behanceUrl?.Trim();
        MediumUrl = mediumUrl?.Trim();
        TwitterUrl = twitterUrl?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateJobPreferences(
        string? preferredJobTitles,
        string? preferredLocations,
        decimal? expectedSalary,
        string? currency,
        string? employmentTypePreference,
        string? workMode,
        string? noticePeriod,
        bool willingToRelocate,
        bool openToOpportunities)
    {
        PreferredJobTitles = preferredJobTitles?.Trim();
        PreferredLocations = preferredLocations?.Trim();
        ExpectedSalary = expectedSalary;
        Currency = string.IsNullOrWhiteSpace(currency) ? "USD" : currency.Trim();
        EmploymentTypePreference = employmentTypePreference?.Trim();
        WorkMode = workMode?.Trim();
        NoticePeriod = noticePeriod?.Trim();
        WillingToRelocate = willingToRelocate;
        OpenToOpportunities = openToOpportunities;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdatePrivacySettings(
        bool allowRecruiterSearch,
        bool showEmail,
        bool showPhone,
        bool showResume,
        bool receiveEmails,
        bool receiveSms,
        bool talentPoolConsent,
        bool allowAiAnalysis)
    {
        AllowRecruiterSearch = allowRecruiterSearch;
        ShowEmail = showEmail;
        ShowPhone = showPhone;
        ShowResume = showResume;
        ReceiveEmails = receiveEmails;
        ReceiveSms = receiveSms;
        TalentPoolConsent = talentPoolConsent;
        AllowAiAnalysis = allowAiAnalysis;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetResumeUrl(string resumeBlobUrl)
    {
        if (string.IsNullOrWhiteSpace(resumeBlobUrl))
        {
            throw new CandidateDomainException("Resume URL cannot be empty.");
        }

        ResumeBlobUrl = resumeBlobUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetProfilePictureUrl(string profilePictureUrl)
    {
        ProfilePictureUrl = profilePictureUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCoverPictureUrl(string coverPictureUrl)
    {
        CoverPictureUrl = coverPictureUrl;
        UpdatedAt = DateTime.UtcNow;
    }


    public void ReplaceSkills(IEnumerable<Guid> skillIds)
        => ReplaceSkills(skillIds.Select(id => new SkillAssignment(id, null)));

    public void ReplaceSkills(IEnumerable<SkillAssignment> skills)
    {
        _skills.Clear();
        foreach (var skill in skills.Where(s => s.SkillId != Guid.Empty)
                                    .GroupBy(s => s.SkillId)
                                    .Select(g => g.First()))
        {
            _skills.Add(new CandidateSkill(Id, skill.SkillId, skill.ProficiencyLevel));
        }

        UpdatedAt = DateTime.UtcNow;
    }

    private static void Guard(string professionalSummary, decimal yearsOfExperience)
    {
        if (string.IsNullOrWhiteSpace(professionalSummary))
        {
            throw new CandidateDomainException("Professional summary is required.");
        }

        if (yearsOfExperience < 0)
        {
            throw new CandidateDomainException("Years of experience cannot be negative.");
        }
    }
}
