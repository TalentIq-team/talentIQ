using Interview.Domain.Entities;
using InterviewEntity = Interview.Domain.Entities.Interview;

namespace Interview.Application.DTOs;

/// <summary>Evaluation scores recorded against an interview.</summary>
public record EvaluationDto(
    Guid Id,
    decimal TechnicalScore,
    decimal BehavioralScore,
    decimal OverallScore,
    string Comments,
    string Recommendation,
    DateTime SubmittedAt)
{
    public static EvaluationDto FromEntity(CandidateEvaluation e) => new(
        e.Id,
        e.TechnicalScore,
        e.BehavioralScore,
        e.OverallScore,
        e.Comments,
        e.Recommendation,
        e.SubmittedAt);
}

/// <summary>List-view projection of an interview.</summary>
public record InterviewSummaryDto(
    Guid Id,
    Guid ApplicationId,
    Guid InterviewerUserId,
    DateTime ScheduledStartTime,
    string MeetingLink,
    InterviewStatus Status)
{
    public static InterviewSummaryDto FromEntity(InterviewEntity i) => new(
        i.Id,
        i.ApplicationId,
        i.InterviewerUserId,
        i.ScheduledStartTime,
        i.MeetingLink,
        i.Status);
}

/// <summary>Interview detail for the evaluation page, including the evaluation if one exists.</summary>
public record InterviewDetailDto(
    Guid Id,
    Guid ApplicationId,
    Guid InterviewerUserId,
    DateTime ScheduledStartTime,
    string MeetingLink,
    InterviewStatus Status,
    string? CancellationReason,
    DateTime? CancelledAt,
    EvaluationDto? Evaluation)
{
    public static InterviewDetailDto FromEntity(InterviewEntity i, CandidateEvaluation? evaluation) => new(
        i.Id,
        i.ApplicationId,
        i.InterviewerUserId,
        i.ScheduledStartTime,
        i.MeetingLink,
        i.Status,
        i.CancellationReason,
        i.CancelledAt,
        evaluation is null ? null : EvaluationDto.FromEntity(evaluation));
}
