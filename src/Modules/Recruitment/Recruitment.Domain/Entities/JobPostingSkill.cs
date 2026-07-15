namespace Recruitment.Domain.Entities;

/// <summary>
/// Join entity linking a <see cref="JobPosting"/> to a required skill (many-to-many).
/// Composite primary key (JobPostingId, SkillId).
/// </summary>
public class JobPostingSkill
{
    public Guid JobPostingId { get; private set; }
    public Guid SkillId { get; private set; }

    public JobPosting? JobPosting { get; private set; }

    // Required by EF Core.
    private JobPostingSkill()
    {
    }

    public JobPostingSkill(Guid jobPostingId, Guid skillId)
    {
        JobPostingId = jobPostingId;
        SkillId = skillId;
    }
}
