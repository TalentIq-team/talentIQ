namespace AI.Application.Interfaces;

public interface IGeminiClient
{
    Task<string> GenerateContentAsync(string prompt, CancellationToken ct = default);
}
