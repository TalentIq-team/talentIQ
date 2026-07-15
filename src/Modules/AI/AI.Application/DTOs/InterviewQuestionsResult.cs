namespace AI.Application.DTOs;

public class InterviewQuestionsResult
{
    public List<InterviewQuestion> Questions { get; set; } = [];
    public bool IsFallbackExecution { get; set; }
}
