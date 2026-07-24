namespace AI.Application.DTOs;

public class InterviewQuestion
{
    public string Type { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string ExpectedAnswerDetails { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
}
