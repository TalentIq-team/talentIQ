namespace AI.Domain.Entities;

public class AiExecutionLog
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public int DurationMs { get; set; }
    public bool IsSuccess { get; set; }
    public bool IsFallback { get; set; }
}
