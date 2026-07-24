using Analytics.Domain.Entities;
using Analytics.Domain.Enums;
using Analytics.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TalentIQ.Api.Controllers;

[ApiController]
[Route("api/v1/talent-pool")]
public class TalentPoolController : ControllerBase
{
    private readonly AnalyticsDbContext _context;

    public TalentPoolController(AnalyticsDbContext context)
    {
        _context = context;
    }

    [HttpPost("reengage")]
    public async Task<IActionResult> ReEngageCandidate(ReEngageCandidateRequest request)
    {
        var entry = await _context.TalentPoolEntries.FindAsync(request.TalentPoolEntryId);

        if (entry == null)
            return NotFound("Talent Pool entry not found.");

        if (!entry.IsActive || entry.ConsentStatus != ConsentStatus.Accepted)
            return BadRequest("Candidate is not active in Talent Pool.");

        return Ok(new
        {
            Message = "Candidate re-engagement invitation sent successfully.",
            TalentPoolEntryId = request.TalentPoolEntryId,
            JobId = request.JobId
        });
    }

    [HttpGet("candidate-report/{talentPoolEntryId}")]
    public async Task<IActionResult> GetCandidateReport(Guid talentPoolEntryId)
    {
        var latestReport = await _context.TalentPoolProgressReports
            .Where(x => x.TalentPoolEntryId == talentPoolEntryId)
            .OrderByDescending(x => x.GeneratedAt)
            .FirstOrDefaultAsync();

        if (latestReport == null)
            return NotFound("No improvement report found for this candidate.");

        return Ok(new
        {
            ProfileStrength = latestReport.CurrentMatchScore >= 70 ? "Trending Up" : "Needs Improvement",
            latestReport.SkillsGainedJson,
            latestReport.ResumeFreshnessStatus,
            latestReport.Recommendation
        });
    }

    [HttpPost("run-monthly-analysis")]
    public async Task<IActionResult> RunMonthlyAnalysis()
    {
        var activeEntries = await _context.TalentPoolEntries
            .Where(x => x.IsActive && x.ConsentStatus == ConsentStatus.Accepted)
            .ToListAsync();

        foreach (var entry in activeEntries)
        {
            var report = new TalentPoolProgressReport
            {
                TalentPoolEntryId = entry.Id,
                SkillsGainedJson = "[\"C#\", \"ASP.NET Core\", \"SQL Server\"]",
                ResumeFreshnessStatus = "Updated",
                CurrentMatchScore = 75,
                Recommendation = "Ready-to-Approach"
            };

            _context.TalentPoolProgressReports.Add(report);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Monthly Talent Pool analysis completed.",
            ReportsGenerated = activeEntries.Count
        });
    }

    [HttpPost("expire-consents")]
    public async Task<IActionResult> ExpireConsents()
    {
        var expiredEntries = await _context.TalentPoolEntries
            .Where(x => x.IsActive &&
                        x.ConsentExpiryDate != null &&
                        x.ConsentExpiryDate < DateTime.UtcNow)
            .ToListAsync();

        foreach (var entry in expiredEntries)
        {
            entry.IsActive = false;
            entry.ConsentStatus = ConsentStatus.Expired;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Expired consents updated successfully.",
            ExpiredCount = expiredEntries.Count
        });
    }

    [HttpPost("propose")]
    public async Task<IActionResult> ProposeCandidate(ProposeTalentPoolRequest request)
    {
        var entry = new TalentPoolEntry
        {
            CandidateProfileId = request.CandidateProfileId,
            AddedByRecruiterId = request.AddedByRecruiterId,
            SkillTags = request.SkillTags,
            ConsentStatus = ConsentStatus.Pending,
            IsActive = true
        };

        _context.TalentPoolEntries.Add(entry);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Candidate proposed for Talent Pool. Consent request pending.",
            EntryId = entry.Id
        });
    }

    [HttpPost("respond-consent")]
    public async Task<IActionResult> RespondConsent(RespondConsentRequest request)
    {
        var entry = await _context.TalentPoolEntries.FindAsync(request.TalentPoolEntryId);

        if (entry == null)
            return NotFound("Talent Pool entry not found.");

        if (request.Accept)
        {
            entry.ConsentStatus = ConsentStatus.Accepted;
            entry.ProfileSnapshotJson = request.ProfileSnapshotJson;
            entry.ConsentRespondedAt = DateTime.UtcNow;
            entry.ConsentExpiryDate = DateTime.UtcNow.AddMonths(12);
            entry.IsActive = true;
        }
        else
        {
            entry.ConsentStatus = ConsentStatus.Declined;
            entry.ConsentRespondedAt = DateTime.UtcNow;
            entry.IsActive = false;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = request.Accept
                ? "Consent accepted. Profile snapshot stored."
                : "Consent declined."
        });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(
        [FromServices] Candidate.Infrastructure.Persistence.CandidateDbContext candidateDb,
        [FromServices] Identity.Infrastructure.IdentityDbContext identityDb)
    {
        var entries = await _context.TalentPoolEntries
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var profiles = await candidateDb.CandidateProfiles.AsNoTracking().ToListAsync();
        var users = await identityDb.Users.AsNoTracking().ToListAsync();

        var profileMap = profiles.ToDictionary(p => p.Id, p => p);
        var userMap = users.ToDictionary(u => u.Id, u => u);

        var result = entries.Select(entry =>
        {
            string candidateName = string.Empty;

            if (!string.IsNullOrEmpty(entry.ProfileSnapshotJson) && entry.ProfileSnapshotJson.Contains(" - "))
            {
                candidateName = entry.ProfileSnapshotJson.Split(" - ")[0];
            }
            else if (profileMap.TryGetValue(entry.CandidateProfileId, out var prof))
            {
                if (!string.IsNullOrEmpty(prof.PreferredName))
                {
                    candidateName = prof.PreferredName;
                }
                else if (userMap.TryGetValue(prof.UserId, out var usr) && !string.IsNullOrEmpty(usr.Email))
                {
                    candidateName = usr.Email.Split('@')[0];
                }
            }

            return new
            {
                entry.Id,
                entry.CandidateProfileId,
                CandidateName = string.IsNullOrEmpty(candidateName) ? "Candidate Profile" : candidateName,
                entry.AddedByRecruiterId,
                entry.ConsentStatus,
                entry.SkillTags,
                entry.ProfileSnapshotJson,
                entry.CreatedAt,
                entry.ConsentRespondedAt,
                entry.ConsentExpiryDate,
                entry.IsActive
            };
        });

        return Ok(result);
    }

    [HttpPost("generate-report")]
    public async Task<IActionResult> GenerateReport(GenerateReportRequest request)
    {
        var entry = await _context.TalentPoolEntries.FindAsync(request.TalentPoolEntryId);

        if (entry == null)
            return NotFound("Talent Pool entry not found.");

        if (entry.ConsentStatus != ConsentStatus.Accepted)
            return BadRequest("Candidate consent is not accepted.");

        var report = new TalentPoolProgressReport
        {
            TalentPoolEntryId = entry.Id,
            SkillsGainedJson = request.SkillsGainedJson,
            ResumeFreshnessStatus = request.ResumeFreshnessStatus,
            CurrentMatchScore = request.CurrentMatchScore,
            Recommendation = request.CurrentMatchScore >= 70
                ? "Ready-to-Approach"
                : "Needs-More-Time"
        };

        _context.TalentPoolProgressReports.Add(report);
        await _context.SaveChangesAsync();

        return Ok(report);
    }

    [HttpPost("withdraw-consent")]
    public async Task<IActionResult> WithdrawConsent(WithdrawConsentRequest request)
    {
        var entry = await _context.TalentPoolEntries.FindAsync(request.TalentPoolEntryId);

        if (entry == null)
            return NotFound("Talent Pool entry not found.");

        entry.ConsentStatus = ConsentStatus.Withdrawn;
        entry.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok("Consent withdrawn successfully.");
    }
}

public record ProposeTalentPoolRequest(
    Guid CandidateProfileId,
    Guid AddedByRecruiterId,
    string SkillTags
);

public record RespondConsentRequest(
    Guid TalentPoolEntryId,
    bool Accept,
    string ProfileSnapshotJson
);

public record GenerateReportRequest(
    Guid TalentPoolEntryId,
    string SkillsGainedJson,
    string ResumeFreshnessStatus,
    decimal CurrentMatchScore
);

public record WithdrawConsentRequest(
    Guid TalentPoolEntryId
);
public record ReEngageCandidateRequest(
    Guid TalentPoolEntryId,
    Guid JobId
);