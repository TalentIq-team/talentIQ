namespace AI.Domain.Entities;

public class InterviewQuestionSet
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public string QuestionsJson { get; set; } = string.Empty;
    public bool IsFallbackExecution { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
