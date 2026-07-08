using AI.Application.DTOs;

namespace AI.Application.Services;

/// <summary>
/// Deterministic rule-based fallback scorer (FR-AI-02).
/// Uses case-insensitive keyword overlap against required skills list.
/// Produces the same ResumeAnalysisResult shape so callers see no difference.
/// </summary>
public class FallbackScoringService
{
    public ResumeAnalysisResult ScoreResume(string resumeText, List<string> requiredSkills)
    {
        var resumeLower = resumeText.ToLowerInvariant();

        var matched = new List<string>();
        var missing = new List<string>();

        foreach (var skill in requiredSkills)
        {
            if (string.IsNullOrWhiteSpace(skill)) continue;

            // Check for the skill as a whole phrase (case-insensitive)
            if (resumeLower.Contains(skill.ToLowerInvariant()))
            {
                matched.Add(skill);
            }
            else
            {
                missing.Add(skill);
            }
        }

        // Score: percentage of required skills found, scaled to 0-100
        var total = matched.Count + missing.Count;
        var score = total > 0
            ? Math.Round((decimal)matched.Count / total * 100, 1)
            : 0m;

        // Build an explainable summary
        var summary = BuildSummary(matched, missing, score);

        return new ResumeAnalysisResult
        {
            OverallMatchScore = score,
            MatchedSkills = matched,
            MissingSkills = missing,
            Summary = summary,
            IsFallbackExecution = true
        };
    }

    public InterviewQuestionsResult GenerateFallbackQuestions(string jobTitle)
    {
        var questions = new List<InterviewQuestion>
        {
            new() { Type = "Technical", Question = $"Describe your experience with the core technologies required for the {jobTitle} role." },
            new() { Type = "Technical", Question = $"Walk me through a challenging technical problem you solved in a previous {jobTitle} position." },
            new() { Type = "Behavioral", Question = "Tell me about a time you had to work under a tight deadline. How did you manage your time?" },
            new() { Type = "Behavioral", Question = "Describe a situation where you had a conflict with a team member. How did you resolve it?" },
            new() { Type = "Scenario", Question = $"Imagine you're starting as a {jobTitle} and find that the existing codebase has significant technical debt. How would you approach this?" },
            new() { Type = "Scenario", Question = "If you were assigned a project with unclear requirements, what steps would you take to move forward?" },
            new() { Type = "Technical", Question = "What is your approach to code reviews? What do you look for when reviewing others' code?" },
            new() { Type = "Behavioral", Question = "Give an example of how you've mentored or helped a junior colleague grow." }
        };

        return new InterviewQuestionsResult
        {
            Questions = questions,
            IsFallbackExecution = true
        };
    }

    private static string BuildSummary(List<string> matched, List<string> missing, decimal score)
    {
        var parts = new List<string>();

        if (matched.Count > 0)
        {
            parts.Add($"Strengths: The candidate demonstrates experience with {string.Join(", ", matched)} " +
                       $"({matched.Count} of {matched.Count + missing.Count} required skills found).");
        }

        if (missing.Count > 0)
        {
            parts.Add($"Gaps: The candidate's résumé does not mention {string.Join(", ", missing)}. " +
                       "These skills may need to be assessed during the interview.");
        }

        parts.Add($"Overall match score: {score}/100. " +
                  (score >= 70 ? "This is a strong match." :
                   score >= 40 ? "This is a moderate match — further evaluation recommended." :
                                 "This is a weak match — significant skill gaps identified."));

        parts.Add("[Scored via deterministic keyword-matching fallback]");

        return string.Join(" ", parts);
    }
}
