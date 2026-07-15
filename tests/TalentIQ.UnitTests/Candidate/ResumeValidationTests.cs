using Candidate.Application.Common;
using FluentAssertions;
using Xunit;

namespace TalentIQ.UnitTests.Candidate;

/// <summary>
/// Verifies FR-CD-02 resume upload rules: PDF/DOCX only, max 5 MB.
/// </summary>
public class ResumeValidationTests
{
    private const string Pdf = "application/pdf";
    private const string Docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    [Theory]
    [InlineData("cv.pdf", Pdf, 1024)]
    [InlineData("cv.docx", Docx, 4 * 1024 * 1024)]
    [InlineData("CV.PDF", Pdf, 5 * 1024 * 1024)] // exactly 5 MB, case-insensitive
    public void IsValid_AllowedFiles_ReturnsTrue(string fileName, string contentType, long length)
    {
        ResumeValidationRules.IsValid(fileName, contentType, length).Should().BeTrue();
    }

    [Theory]
    [InlineData("cv.txt", "text/plain", 100)]           // wrong extension + content type
    [InlineData("cv.exe", "application/octet-stream", 100)]
    [InlineData("cv.pdf", Pdf, (5 * 1024 * 1024) + 1)]  // over 5 MB
    [InlineData("cv.pdf", Pdf, 0)]                        // empty
    [InlineData("cv.png", "image/png", 2048)]
    public void IsValid_DisallowedFiles_ReturnsFalse(string fileName, string contentType, long length)
    {
        ResumeValidationRules.IsValid(fileName, contentType, length).Should().BeFalse();
    }

    [Fact]
    public void MaxSize_Is5Megabytes()
    {
        ResumeValidationRules.MaxSizeBytes.Should().Be(5 * 1024 * 1024);
    }

    [Fact]
    public void IsAllowedSize_BoundaryConditions()
    {
        ResumeValidationRules.IsAllowedSize(ResumeValidationRules.MaxSizeBytes).Should().BeTrue();
        ResumeValidationRules.IsAllowedSize(ResumeValidationRules.MaxSizeBytes + 1).Should().BeFalse();
        ResumeValidationRules.IsAllowedSize(0).Should().BeFalse();
    }
}
