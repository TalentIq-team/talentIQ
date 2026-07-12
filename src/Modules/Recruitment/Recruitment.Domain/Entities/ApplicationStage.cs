namespace Recruitment.Domain.Entities;

/// <summary>
/// Stages of the recruitment application workflow (FR-CD-05).
/// Valid transitions between stages are governed by the State pattern
/// (see <c>Recruitment.Domain.States</c>).
/// </summary>
public enum ApplicationStage
{
    Applied = 1,
    Screening = 2,
    Shortlisted = 3,
    InterviewScheduled = 4,
    Interviewed = 5,
    Offered = 6,
    Hired = 7,
    Rejected = 8
}
