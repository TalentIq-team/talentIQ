namespace Recruitment.Domain.Entities;

/// <summary>Employment type of a job posting, used as a job-search filter (FR-CD-03).</summary>
public enum EmploymentType
{
    FullTime = 1,
    PartTime = 2,
    Contract = 3,
    Internship = 4,
    Temporary = 5
}
