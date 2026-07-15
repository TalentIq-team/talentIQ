using System.Text;
using System.Text.Json;
using AI.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AI.Infrastructure.Clients;

/// <summary>
/// Calls the Google Gemini REST API (generateContent endpoint).
/// Uses HttpClientFactory for proper lifecycle management.
/// </summary>
public class GeminiClient : IGeminiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<GeminiClient> _logger;

    public GeminiClient(HttpClient httpClient, IConfiguration config, ILogger<GeminiClient> logger)
    {
        _httpClient = httpClient;
        _apiKey = config["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey is not configured");
        _model = config["Gemini:Model"] ?? "gemini-2.0-flash";
        _logger = logger;

        var timeoutSeconds = int.TryParse(config["Gemini:TimeoutSeconds"], out var t) ? t : 15;
        _httpClient.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
    }

    public async Task<string> GenerateContentAsync(string prompt, CancellationToken ct = default)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.3,
                maxOutputTokens = 2048
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _logger.LogDebug("Calling Gemini API model={Model}", _model);

        var response = await _httpClient.PostAsync(url, content, ct);

        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Gemini API returned {StatusCode}: {Body}",
                response.StatusCode, responseBody[..Math.Min(500, responseBody.Length)]);
            throw new HttpRequestException(
                $"Gemini API returned {response.StatusCode}: {responseBody[..Math.Min(200, responseBody.Length)]}");
        }

        // Extract the text from the Gemini response structure:
        // { "candidates": [{ "content": { "parts": [{ "text": "..." }] } }] }
        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(text))
        {
            throw new InvalidOperationException("Gemini returned an empty response");
        }

        _logger.LogDebug("Gemini response received, length={Length}", text.Length);

        return text;
    }
}
