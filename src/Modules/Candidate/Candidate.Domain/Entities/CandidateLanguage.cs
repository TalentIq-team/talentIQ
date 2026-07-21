namespace Candidate.Domain.Entities;

public class CandidateLanguage
{
    public Guid Id { get; private set; }
    public Guid CandidateProfileId { get; private set; }
    public string Language { get; private set; } = string.Empty;
    public string ReadingLevel { get; private set; } = "Native";
    public string WritingLevel { get; private set; } = "Native";
    public string SpeakingLevel { get; private set; } = "Native";

    public CandidateProfile? CandidateProfile { get; private set; }

    private CandidateLanguage() { }

    public CandidateLanguage(
        Guid candidateProfileId,
        string language,
        string readingLevel,
        string writingLevel,
        string speakingLevel)
    {
        Id = Guid.NewGuid();
        CandidateProfileId = candidateProfileId;
        Update(language, readingLevel, writingLevel, speakingLevel);
    }

    public void Update(
        string language,
        string readingLevel,
        string writingLevel,
        string speakingLevel)
    {
        Language = language.Trim();
        ReadingLevel = string.IsNullOrWhiteSpace(readingLevel) ? "Native" : readingLevel.Trim();
        WritingLevel = string.IsNullOrWhiteSpace(writingLevel) ? "Native" : writingLevel.Trim();
        SpeakingLevel = string.IsNullOrWhiteSpace(speakingLevel) ? "Native" : speakingLevel.Trim();
    }
}
