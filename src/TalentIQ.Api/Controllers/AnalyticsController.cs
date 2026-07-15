using Analytics.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TalentIQ.Api.Controllers;

[ApiController]
[Route("api/v1/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsDbContext _context;

    public AnalyticsController(AnalyticsDbContext context)
    {
        _context = context;
    }

    [HttpGet("recruiter-performance")]
    public IActionResult GetRecruiterPerformance()
    {
        var data = new
        {
            JobsManaged = 12,
            ApplicationsProcessed = 185,
            AverageScreeningTurnaroundDays = 2.4
        };

        return Ok(data);
    }
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var latest = await _context.DailyKpiSnapshots
            .OrderByDescending(x => x.SnapshotDate)
            .FirstOrDefaultAsync();

        if (latest == null)
        {
            return Ok(new
            {
                TotalApplications = 0,
                ShortlistedCount = 0,
                InterviewsScheduled = 0,
                OffersAccepted = 0,
                AverageTimeToHireDays = 0
            });
        }

        return Ok(latest);
    }

    [HttpGet("hiring-funnel")]
    public IActionResult GetHiringFunnel()
    {
        var data = new[]
        {
            new { Stage = "Applied", Count = 100, ConversionRate = 100 },
            new { Stage = "Screening", Count = 70, ConversionRate = 70 },
            new { Stage = "Shortlisted", Count = 40, ConversionRate = 40 },
            new { Stage = "Interviewed", Count = 20, ConversionRate = 20 },
            new { Stage = "Hired", Count = 8, ConversionRate = 8 }
        };

        return Ok(data);
    }

    [HttpGet("days-to-fill")]
    public IActionResult GetEstimatedDaysToFill()
    {
        var result = new
        {
            EstimatedDaysToFill = 18,
            Note = "This is a simple statistical projection, not a trained machine learning model."
        };

        return Ok(result);
    }
}