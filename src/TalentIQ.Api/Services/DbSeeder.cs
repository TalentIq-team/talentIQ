using System.Text.Json;
using AI.Domain.Entities;
using AI.Infrastructure;
using Analytics.Domain.Entities;
using Analytics.Domain.Enums;
using Analytics.Infrastructure;
using Candidate.Domain.Entities;
using Candidate.Infrastructure.Persistence;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using Identity.Infrastructure;
using Interview.Domain.Entities;
using Interview.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Recruitment.Domain.Entities;
using Recruitment.Domain.States;
using Recruitment.Infrastructure.Persistence;

namespace TalentIQ.Api.Services;

public static class DbSeeder
{
    public static async Task SeedDatabaseAsync(IServiceProvider services, ILogger logger)
    {
        logger.LogInformation("Starting database seed check across all modules...");

        var identityDb = services.GetRequiredService<IdentityDbContext>();
        var candidateDb = services.GetRequiredService<CandidateDbContext>();
        var recruitmentDb = services.GetRequiredService<RecruitmentDbContext>();
        var interviewDb = services.GetRequiredService<InterviewDbContext>();
        var aiDb = services.GetRequiredService<AiDbContext>();
        var analyticsDb = services.GetRequiredService<AnalyticsDbContext>();
        var passwordHasher = services.GetRequiredService<IAppPasswordHasher>();

        // 1. Seed Organization and Departments
        var defaultOrg = await identityDb.Organizations.FirstOrDefaultAsync(o => o.Name == "TalentIQ Global");
        if (defaultOrg is null)
        {
            defaultOrg = new Organization
            {
                Id = Guid.NewGuid(),
                Name = "TalentIQ Global"
            };
            await identityDb.Organizations.AddAsync(defaultOrg);
            await identityDb.SaveChangesAsync();

            var deptEng = new Department
            {
                Id = Guid.NewGuid(),
                OrganizationId = defaultOrg.Id,
                Name = "Engineering"
            };
            var deptProd = new Department
            {
                Id = Guid.NewGuid(),
                OrganizationId = defaultOrg.Id,
                Name = "Product & UX"
            };
            var deptOps = new Department
            {
                Id = Guid.NewGuid(),
                OrganizationId = defaultOrg.Id,
                Name = "Operations"
            };

            await identityDb.Departments.AddRangeAsync(deptEng, deptProd, deptOps);
            await identityDb.SaveChangesAsync();
        }

        var engineeringDept = await identityDb.Departments.FirstOrDefaultAsync(d => d.Name == "Engineering");
        var productDept = await identityDb.Departments.FirstOrDefaultAsync(d => d.Name == "Product & UX");

        // 2. Seed Users
        var usersToEnsure = new[]
        {
            new { Email = "admin@talentiq.dev", Role = UserRole.Admin, DeptId = (Guid?)null },
            new { Email = "recruiter@talentiq.dev", Role = UserRole.Recruiter, DeptId = engineeringDept?.Id },
            new { Email = "manager@talentiq.dev", Role = UserRole.HiringManager, DeptId = engineeringDept?.Id },
            new { Email = "candidate@talentiq.dev", Role = UserRole.Candidate, DeptId = (Guid?)null },
            new { Email = "john.doe@talentiq.dev", Role = UserRole.Candidate, DeptId = (Guid?)null },
            new { Email = "jane.smith@talentiq.dev", Role = UserRole.Candidate, DeptId = (Guid?)null },
            new { Email = "alex.developer@talentiq.dev", Role = UserRole.Candidate, DeptId = (Guid?)null },
        };

        foreach (var u in usersToEnsure)
        {
            var existing = await identityDb.Users.FirstOrDefaultAsync(x => x.Email == u.Email);
            if (existing is null)
            {
                var newUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = u.Email,
                    PasswordHash = passwordHasher.HashPassword("Password123!"),
                    Role = u.Role,
                    OrganizationId = defaultOrg.Id,
                    DepartmentId = u.DeptId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow.AddHours(-2)
                };
                await identityDb.Users.AddAsync(newUser);
            }
        }
        await identityDb.SaveChangesAsync();

        var candidateUser = await identityDb.Users.FirstAsync(u => u.Email == "candidate@talentiq.dev");
        var johnUser = await identityDb.Users.FirstAsync(u => u.Email == "john.doe@talentiq.dev");
        var janeUser = await identityDb.Users.FirstAsync(u => u.Email == "jane.smith@talentiq.dev");
        var alexUser = await identityDb.Users.FirstAsync(u => u.Email == "alex.developer@talentiq.dev");
        var recruiterUser = await identityDb.Users.FirstAsync(u => u.Email == "recruiter@talentiq.dev");
        var managerUser = await identityDb.Users.FirstAsync(u => u.Email == "manager@talentiq.dev");

        // 3. Seed Candidate Skills
        if (!await candidateDb.Skills.AnyAsync())
        {
            var skills = new[]
            {
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000001"), "React", "Frontend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000002"), "TypeScript", "Frontend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000003"), "C#", "Backend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000004"), "ASP.NET Core", "Backend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000005"), "EF Core", "Backend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000006"), "SQL Server", "Database"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000007"), "Python", "AI/ML"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000008"), "Gemini API", "AI/ML"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000009"), "Docker", "DevOps"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000010"), "Kubernetes", "DevOps"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000011"), "TailwindCSS", "Frontend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000012"), "System Design", "Architecture"),
            };
            await candidateDb.Skills.AddRangeAsync(skills);
            await candidateDb.SaveChangesAsync();
        }

        var skillReact = await candidateDb.Skills.FirstAsync(s => s.Name == "React");
        var skillTs = await candidateDb.Skills.FirstAsync(s => s.Name == "TypeScript");
        var skillCSharp = await candidateDb.Skills.FirstAsync(s => s.Name == "C#");
        var skillDotNet = await candidateDb.Skills.FirstAsync(s => s.Name == "ASP.NET Core");
        var skillPython = await candidateDb.Skills.FirstAsync(s => s.Name == "Python");

        // 4. Seed Candidate Profiles
        if (!await candidateDb.CandidateProfiles.AnyAsync())
        {
            var profileMain = CandidateProfile.Create(
                candidateUser.Id,
                "Accomplished Full Stack Software Engineer with 5+ years building scalable cloud-native Web APIs in C#, React 19, and cloud platforms.",
                5.5m);
            profileMain.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/candidate_main_cv.pdf");
            profileMain.ReplaceSkills(new[] { skillReact.Id, skillTs.Id, skillCSharp.Id, skillDotNet.Id });

            var profileJohn = CandidateProfile.Create(
                johnUser.Id,
                "Senior AI & Backend Developer specializing in Gemini API integration, microservices, Python, and SQL optimization.",
                6.0m);
            profileJohn.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/john_doe_cv.pdf");
            profileJohn.ReplaceSkills(new[] { skillCSharp.Id, skillDotNet.Id, skillPython.Id });

            var profileJane = CandidateProfile.Create(
                janeUser.Id,
                "Frontend UI/UX Architect focused on accessible Web Applications, TailwindCSS, React performance, and modern Web design systems.",
                4.0m);
            profileJane.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/jane_smith_cv.pdf");
            profileJane.ReplaceSkills(new[] { skillReact.Id, skillTs.Id, skillPython.Id });

            var profileAlex = CandidateProfile.Create(
                alexUser.Id,
                "Passionate Full Stack Engineer with expertise in C#, EF Core, PostgreSQL, and Docker containerization.",
                3.0m);
            profileAlex.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/alex_dev_cv.pdf");
            profileAlex.ReplaceSkills(new[] { skillCSharp.Id, skillDotNet.Id, skillReact.Id });

            await candidateDb.CandidateProfiles.AddRangeAsync(profileMain, profileJohn, profileJane, profileAlex);
            await candidateDb.SaveChangesAsync();
        }

        var candidateProfile = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == candidateUser.Id);
        var johnProfile = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == johnUser.Id);
        var janeProfile = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == janeUser.Id);

        // 5. Seed Job Postings (Recruitment)
        if (!await recruitmentDb.JobPostings.AnyAsync())
        {
            var job1 = JobPosting.Create(
                defaultOrg.Id, recruiterUser.Id,
                "Senior React & Frontend Architect",
                "Lead the modernization of frontend web applications using React 19, Vite, TypeScript, and TailwindCSS. Implement high-performance UI components aligned with enterprise design token systems.",
                "Colombo, Sri Lanka (Hybrid)",
                EmploymentType.FullTime, 5);
            job1.Publish();
            job1.ReplaceSkills(new[] { skillReact.Id, skillTs.Id });

            var job2 = JobPosting.Create(
                defaultOrg.Id, recruiterUser.Id,
                "Full Stack .NET & C# Engineer",
                "Architect scalable web APIs and backend services using ASP.NET Core 8, EF Core, and SQL Server. Build secure identity integrations and microservice endpoints.",
                "Remote / Kandy, Sri Lanka",
                EmploymentType.FullTime, 3);
            job2.Publish();
            job2.ReplaceSkills(new[] { skillCSharp.Id, skillDotNet.Id });

            var job3 = JobPosting.Create(
                defaultOrg.Id, recruiterUser.Id,
                "AI / ML Integration Specialist (Gemini API)",
                "Integrate Gemini LLM models and vector search capabilities into recruitment pipelines. Develop explainable AI match scoring and automated candidate evaluation algorithms.",
                "Remote (Global)",
                EmploymentType.FullTime, 3);
            job3.Publish();
            job3.ReplaceSkills(new[] { skillPython.Id, skillCSharp.Id });

            var job4 = JobPosting.Create(
                defaultOrg.Id, recruiterUser.Id,
                "Cloud Infrastructure & DevOps Engineer",
                "Manage cloud infrastructure, CI/CD automation pipelines, Kubernetes clusters, and Docker container orchestration with high availability standards.",
                "Colombo, Sri Lanka (On-site)",
                EmploymentType.Contract, 4);
            job4.Publish();

            var job5 = JobPosting.Create(
                defaultOrg.Id, recruiterUser.Id,
                "UI/UX Product Designer",
                "Design intuitive design systems, interactive prototypes, and design token scales. Conduct user research and accessibility audits for enterprise applications.",
                "Colombo, Sri Lanka",
                EmploymentType.Internship, 1);
            job5.Publish();

            await recruitmentDb.JobPostings.AddRangeAsync(job1, job2, job3, job4, job5);
            await recruitmentDb.SaveChangesAsync();
        }

        var reactJob = await recruitmentDb.JobPostings.FirstAsync(j => j.Title.Contains("React"));
        var dotnetJob = await recruitmentDb.JobPostings.FirstAsync(j => j.Title.Contains(".NET"));
        var aiJob = await recruitmentDb.JobPostings.FirstAsync(j => j.Title.Contains("AI"));

        // 6. Seed Applications (Recruitment)
        if (!await recruitmentDb.Applications.AnyAsync())
        {
            var app1 = Application.Submit(reactJob.Id, candidateProfile.Id);
            app1.SetAiMatchScore(92.5m);
            app1.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Passed initial screening");
            app1.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Candidate profile highly recommended by AI match");
            app1.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "Scheduled technical interview");

            var app2 = Application.Submit(dotnetJob.Id, johnProfile.Id);
            app2.SetAiMatchScore(88.0m);
            app2.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Strong C# experience verified");
            app2.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Shortlisted for Hiring Manager review");

            var app3 = Application.Submit(aiJob.Id, janeProfile.Id);
            app3.SetAiMatchScore(75.0m);
            app3.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Reviewing AI skills");

            var app4 = Application.Submit(dotnetJob.Id, candidateProfile.Id);
            app4.SetAiMatchScore(85.0m);

            await recruitmentDb.Applications.AddRangeAsync(app1, app2, app3, app4);
            await recruitmentDb.SaveChangesAsync();

            // 7. Seed Scheduled Interviews & Evaluations (Interview module)
            if (!await interviewDb.Interviews.AnyAsync())
            {
                var interview1 = new Interview.Domain.Entities.Interview
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app1.Id,
                    InterviewerUserId = managerUser.Id,
                    ScheduledStartTime = DateTime.UtcNow.AddDays(1).AddHours(3),
                    MeetingLink = "https://meet.google.com/abc-defg-hij",
                    Status = InterviewStatus.Scheduled
                };
                await interviewDb.Interviews.AddAsync(interview1);
                await interviewDb.SaveChangesAsync();

                var eval1 = new CandidateEvaluation
                {
                    Id = Guid.NewGuid(),
                    InterviewId = interview1.Id,
                    TechnicalScore = 9.0m,
                    BehavioralScore = 8.5m,
                    Recommendation = "StrongHire"
                };
                await interviewDb.CandidateEvaluations.AddAsync(eval1);
                await interviewDb.SaveChangesAsync();
            }

            // 8. Seed AI Analysis & Execution Logs
            if (!await aiDb.ResumeAnalyses.AnyAsync())
            {
                var analysis1 = new ResumeAnalysis
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app1.Id,
                    OverallMatchScore = 92.5m,
                    MatchedSkillsJson = JsonSerializer.Serialize(new[] { "React", "TypeScript", "C#", "ASP.NET Core" }),
                    MissingSkillsJson = JsonSerializer.Serialize(new[] { "GraphQL" }),
                    Summary = "Candidate demonstrates excellent proficiency in React architecture and C# backend Web APIs.",
                    IsFallbackExecution = false,
                    CreatedAt = DateTime.UtcNow
                };
                await aiDb.ResumeAnalyses.AddAsync(analysis1);

                var log1 = new AiExecutionLog
                {
                    Id = Guid.NewGuid(),
                    Feature = "ResumeAnalysis",
                    Provider = "Gemini-1.5-Pro",
                    DurationMs = 450,
                    IsSuccess = true,
                    IsFallback = false,
                    ExecutedAt = DateTime.UtcNow
                };
                var log2 = new AiExecutionLog
                {
                    Id = Guid.NewGuid(),
                    Feature = "InterviewQuestionGen",
                    Provider = "Gemini-1.5-Pro",
                    DurationMs = 380,
                    IsSuccess = true,
                    IsFallback = false,
                    ExecutedAt = DateTime.UtcNow
                };
                await aiDb.AiExecutionLogs.AddRangeAsync(log1, log2);
                await aiDb.SaveChangesAsync();
            }

            // 9. Seed Analytics & Talent Pool (Analytics module)
            if (!await analyticsDb.DailyKpiSnapshots.AnyAsync())
            {
                for (int i = 7; i >= 0; i--)
                {
                    var snapshot = new DailyKpiSnapshot
                    {
                        Id = Guid.NewGuid(),
                        OrganizationId = defaultOrg.Id,
                        SnapshotDate = DateTime.UtcNow.Date.AddDays(-i),
                        TotalApplications = 24 + (7 - i) * 3,
                        ShortlistedCount = 12 + (7 - i),
                        InterviewsScheduled = 8 + i,
                        OffersAccepted = 4 + i / 2,
                        AverageTimeToHireDays = 18.5m
                    };
                    await analyticsDb.DailyKpiSnapshots.AddAsync(snapshot);
                }
                await analyticsDb.SaveChangesAsync();
            }

            if (!await analyticsDb.TalentPoolEntries.AnyAsync())
            {
                var entry = new TalentPoolEntry
                {
                    Id = Guid.NewGuid(),
                    CandidateProfileId = candidateUser.Id,
                    AddedByRecruiterId = recruiterUser.Id,
                    ConsentStatus = ConsentStatus.Accepted,
                    SkillTags = "[\"Frontend\", \"Backend\"]",
                    ProfileSnapshotJson = "Senior Full Stack Engineer with 5+ years experience.",
                    CreatedAt = DateTime.UtcNow,
                    ConsentRespondedAt = DateTime.UtcNow,
                    ConsentExpiryDate = DateTime.UtcNow.AddMonths(12),
                    IsActive = true
                };

                await analyticsDb.TalentPoolEntries.AddAsync(entry);
                await analyticsDb.SaveChangesAsync();

                var progressReport = new TalentPoolProgressReport
                {
                    Id = Guid.NewGuid(),
                    TalentPoolEntryId = entry.Id,
                    SkillsGainedJson = "[\"Added Docker certification\", \"Gained system design experience\"]",
                    ResumeFreshnessStatus = "Updated",
                    CurrentMatchScore = 94.0m,
                    Recommendation = "Ready-to-Approach",
                    GeneratedAt = DateTime.UtcNow
                };
                await analyticsDb.TalentPoolProgressReports.AddAsync(progressReport);
                await analyticsDb.SaveChangesAsync();
            }
        }

        logger.LogInformation("Database seed check completed successfully!");
    }
}
