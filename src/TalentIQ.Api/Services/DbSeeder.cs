using System.Text.Json;
using AI.Domain.Entities;
using AI.Infrastructure;
using Analytics.Domain.Entities;
using Analytics.Domain.Enums;
using Analytics.Infrastructure;
using Candidate.Domain.Entities;
using Candidate.Domain.Enums;
using Candidate.Infrastructure.Persistence;
using Identity.Application.Interfaces;
using Identity.Domain.Entities;
using Identity.Infrastructure;
using Interview.Domain.Entities;
using Interview.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Notification.Infrastructure;
using Recruitment.Domain.Entities;
using Recruitment.Domain.States;
using Recruitment.Infrastructure.Persistence;

namespace TalentIQ.Api.Services;

/// <summary>
/// Comprehensive demo seed data for all modules.
/// Idempotent — safe to run on every startup. Each section checks
/// whether its data already exists before inserting.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedDatabaseAsync(IServiceProvider services, ILogger logger)
    {
        logger.LogInformation("Starting comprehensive database seed across all modules...");

        var identityDb = services.GetRequiredService<IdentityDbContext>();
        var candidateDb = services.GetRequiredService<CandidateDbContext>();
        var recruitmentDb = services.GetRequiredService<RecruitmentDbContext>();
        var interviewDb = services.GetRequiredService<InterviewDbContext>();
        var aiDb = services.GetRequiredService<AiDbContext>();
        var analyticsDb = services.GetRequiredService<AnalyticsDbContext>();
        var notificationDb = services.GetRequiredService<NotificationDbContext>();
        var passwordHasher = services.GetRequiredService<IAppPasswordHasher>();

        // ════════════════════════════════════════════════════════════════
        // 1. ORGANIZATION & DEPARTMENTS
        // ════════════════════════════════════════════════════════════════
        var defaultOrg = await identityDb.Organizations.FirstOrDefaultAsync(o => o.Name == "TalentIQ Global");
        if (defaultOrg is null)
        {
            defaultOrg = new Organization { Id = Guid.NewGuid(), Name = "TalentIQ Global" };
            await identityDb.Organizations.AddAsync(defaultOrg);
            await identityDb.SaveChangesAsync();
            logger.LogInformation("Seeded organization: TalentIQ Global");
        }

        var deptNames = new[] { "Engineering", "Product & UX", "Operations", "Human Resources", "Data Science", "Quality Assurance" };
        foreach (var name in deptNames)
        {
            if (!await identityDb.Departments.AnyAsync(d => d.Name == name))
            {
                await identityDb.Departments.AddAsync(new Department
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = defaultOrg.Id,
                    Name = name
                });
            }
        }
        await identityDb.SaveChangesAsync();

        var deptEngineering = await identityDb.Departments.FirstAsync(d => d.Name == "Engineering");
        var deptProduct = await identityDb.Departments.FirstAsync(d => d.Name == "Product & UX");
        var deptOps = await identityDb.Departments.FirstAsync(d => d.Name == "Operations");
        var deptHR = await identityDb.Departments.FirstAsync(d => d.Name == "Human Resources");
        var deptDS = await identityDb.Departments.FirstAsync(d => d.Name == "Data Science");
        var deptQA = await identityDb.Departments.FirstAsync(d => d.Name == "Quality Assurance");

        // ════════════════════════════════════════════════════════════════
        // 2. USERS (15 total: 1 Admin, 2 Recruiters, 1 Manager, 11 Candidates)
        // ════════════════════════════════════════════════════════════════
        var usersToSeed = new (string Email, UserRole Role, Guid? DeptId)[]
        {
            ("admin@talentiq.dev", UserRole.Admin, null),
            ("recruiter@talentiq.dev", UserRole.Recruiter, deptEngineering.Id),
            ("lisa.recruiter@talentiq.dev", UserRole.Recruiter, deptHR.Id),
            ("manager@talentiq.dev", UserRole.HiringManager, deptEngineering.Id),
            ("candidate@talentiq.dev", UserRole.Candidate, null),
            ("john.doe@talentiq.dev", UserRole.Candidate, null),
            ("jane.smith@talentiq.dev", UserRole.Candidate, null),
            ("alex.developer@talentiq.dev", UserRole.Candidate, null),
            ("shamikakeshanuni@gmail.com", UserRole.Candidate, null),
            ("sarah.kumar@talentiq.dev", UserRole.Candidate, null),
            ("david.wilson@talentiq.dev", UserRole.Candidate, null),
            ("emma.taylor@talentiq.dev", UserRole.Candidate, null),
            ("james.park@talentiq.dev", UserRole.Candidate, null),
            ("priya.patel@talentiq.dev", UserRole.Candidate, null),
            ("tom.anderson@talentiq.dev", UserRole.Candidate, null),
        };

        foreach (var (email, role, deptId) in usersToSeed)
        {
            var existing = await identityDb.Users.FirstOrDefaultAsync(x => x.Email == email);
            if (existing is null)
            {
                await identityDb.Users.AddAsync(new User
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    PasswordHash = passwordHasher.HashPassword("Password123!"),
                    Role = role,
                    OrganizationId = defaultOrg.Id,
                    DepartmentId = deptId,
                    IsActive = true
                });
            }
            else
            {
                bool updated = false;
                if (existing.OrganizationId == Guid.Empty) { existing.OrganizationId = defaultOrg.Id; updated = true; }
                if (existing.DepartmentId is null && deptId is not null) { existing.DepartmentId = deptId; updated = true; }
                if (updated) identityDb.Users.Update(existing);
            }
        }
        await identityDb.SaveChangesAsync();

        // Query back all users
        var adminUser = await identityDb.Users.FirstAsync(u => u.Email == "admin@talentiq.dev");
        var recruiterUser = await identityDb.Users.FirstAsync(u => u.Email == "recruiter@talentiq.dev");
        var lisaRecruiter = await identityDb.Users.FirstAsync(u => u.Email == "lisa.recruiter@talentiq.dev");
        var managerUser = await identityDb.Users.FirstAsync(u => u.Email == "manager@talentiq.dev");
        var candidateUser = await identityDb.Users.FirstAsync(u => u.Email == "candidate@talentiq.dev");
        var johnUser = await identityDb.Users.FirstAsync(u => u.Email == "john.doe@talentiq.dev");
        var janeUser = await identityDb.Users.FirstAsync(u => u.Email == "jane.smith@talentiq.dev");
        var alexUser = await identityDb.Users.FirstAsync(u => u.Email == "alex.developer@talentiq.dev");
        var michaelUser = await identityDb.Users.FirstAsync(u => u.Email == "michael.chen@talentiq.dev");
        var sarahUser = await identityDb.Users.FirstAsync(u => u.Email == "sarah.kumar@talentiq.dev");
        var davidUser = await identityDb.Users.FirstAsync(u => u.Email == "david.wilson@talentiq.dev");
        var emmaUser = await identityDb.Users.FirstAsync(u => u.Email == "emma.taylor@talentiq.dev");
        var jamesUser = await identityDb.Users.FirstAsync(u => u.Email == "james.park@talentiq.dev");
        var priyaUser = await identityDb.Users.FirstAsync(u => u.Email == "priya.patel@talentiq.dev");
        var tomUser = await identityDb.Users.FirstAsync(u => u.Email == "tom.anderson@talentiq.dev");

        logger.LogInformation("Users seeded/verified: 15");

        // ════════════════════════════════════════════════════════════════
        // 3. SKILLS (25 skills across 7 categories)
        // ════════════════════════════════════════════════════════════════
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
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000013"), "Node.js", "Backend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000014"), "Java", "Backend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000015"), "AWS", "Cloud"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000016"), "Azure", "Cloud"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000017"), "GraphQL", "Backend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000018"), "PostgreSQL", "Database"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000019"), "Redis", "Database"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000020"), "Machine Learning", "AI/ML"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000021"), "React Native", "Mobile"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000022"), "Selenium", "Testing"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000023"), "Figma", "Design"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000024"), "Go", "Backend"),
                new Skill(Guid.Parse("10000000-0000-0000-0000-000000000025"), "MongoDB", "Database"),
            };
            await candidateDb.Skills.AddRangeAsync(skills);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded 25 skills");
        }

        // Query back commonly-used skills
        var skillReact = await candidateDb.Skills.FirstAsync(s => s.Name == "React");
        var skillTs = await candidateDb.Skills.FirstAsync(s => s.Name == "TypeScript");
        var skillCSharp = await candidateDb.Skills.FirstAsync(s => s.Name == "C#");
        var skillDotNet = await candidateDb.Skills.FirstAsync(s => s.Name == "ASP.NET Core");
        var skillEfCore = await candidateDb.Skills.FirstAsync(s => s.Name == "EF Core");
        var skillSql = await candidateDb.Skills.FirstAsync(s => s.Name == "SQL Server");
        var skillPython = await candidateDb.Skills.FirstAsync(s => s.Name == "Python");
        var skillGemini = await candidateDb.Skills.FirstAsync(s => s.Name == "Gemini API");
        var skillDocker = await candidateDb.Skills.FirstAsync(s => s.Name == "Docker");
        var skillK8s = await candidateDb.Skills.FirstAsync(s => s.Name == "Kubernetes");
        var skillTailwind = await candidateDb.Skills.FirstAsync(s => s.Name == "TailwindCSS");
        var skillSysDesign = await candidateDb.Skills.FirstAsync(s => s.Name == "System Design");
        var skillNode = await candidateDb.Skills.FirstAsync(s => s.Name == "Node.js");
        var skillJava = await candidateDb.Skills.FirstAsync(s => s.Name == "Java");
        var skillAws = await candidateDb.Skills.FirstAsync(s => s.Name == "AWS");
        var skillAzure = await candidateDb.Skills.FirstAsync(s => s.Name == "Azure");
        var skillGraphQL = await candidateDb.Skills.FirstAsync(s => s.Name == "GraphQL");
        var skillPostgres = await candidateDb.Skills.FirstAsync(s => s.Name == "PostgreSQL");
        var skillRedis = await candidateDb.Skills.FirstAsync(s => s.Name == "Redis");
        var skillML = await candidateDb.Skills.FirstAsync(s => s.Name == "Machine Learning");
        var skillRN = await candidateDb.Skills.FirstAsync(s => s.Name == "React Native");
        var skillSelenium = await candidateDb.Skills.FirstAsync(s => s.Name == "Selenium");
        var skillFigma = await candidateDb.Skills.FirstAsync(s => s.Name == "Figma");
        var skillGo = await candidateDb.Skills.FirstAsync(s => s.Name == "Go");
        var skillMongo = await candidateDb.Skills.FirstAsync(s => s.Name == "MongoDB");

        // ════════════════════════════════════════════════════════════════
        // 4. CANDIDATE PROFILES (11 fully enriched profiles)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateProfiles.AnyAsync())
        {
            // --- Profile 1: Kavinda Perera (candidate@) ---
            var p1 = CandidateProfile.Create(candidateUser.Id,
                "Accomplished Full Stack Software Engineer with 5+ years building scalable cloud-native Web APIs in C#, React 19, and cloud platforms. Passionate about clean architecture, microservices, and developer experience.",
                5.5m, "Kavinda", "Full Stack Engineer | React & .NET", "Senior Full Stack Developer", "TechCorp Solutions");
            p1.UpdatePersonalInfo("Kavinda", null, new DateTime(1996, 3, 15), "Male", "Sri Lankan",
                "42 Galle Road", "Colombo", "Sri Lanka", "00300", "Asia/Colombo");
            p1.UpdateSocialLinks("https://linkedin.com/in/kavinda-perera", "https://github.com/kavinda-dev",
                "https://kavinda.dev", "https://stackoverflow.com/users/kavinda", null, "https://medium.com/@kavinda", null);
            p1.UpdateJobPreferences("Senior Full Stack Engineer, Tech Lead", "Colombo, Singapore, Remote",
                12000m, "USD", "Full-time", "Hybrid", "30 Days", true, true);
            p1.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/kavinda_perera_cv.pdf");
            p1.ReplaceSkills(new[]
            {
                new SkillAssignment(skillReact.Id, "Expert"), new SkillAssignment(skillTs.Id, "Expert"),
                new SkillAssignment(skillCSharp.Id, "Expert"), new SkillAssignment(skillDotNet.Id, "Expert"),
                new SkillAssignment(skillEfCore.Id, "Advanced"), new SkillAssignment(skillDocker.Id, "Advanced"),
                new SkillAssignment(skillSql.Id, "Advanced"), new SkillAssignment(skillTailwind.Id, "Advanced"),
            });

            // --- Profile 2: John Doe (john.doe@) ---
            var p2 = CandidateProfile.Create(johnUser.Id,
                "Senior AI & Backend Developer specializing in Gemini API integration, microservices, Python, and SQL optimization. 6+ years experience designing intelligent systems and high-throughput APIs.",
                6.0m, "John", "AI & Backend Specialist | Python & C#", "AI Integration Lead", "IntelliSoft Labs");
            p2.UpdatePersonalInfo("John", null, new DateTime(1994, 7, 22), "Male", "American",
                "456 Oak Street", "San Francisco", "United States", "94102", "America/Los_Angeles");
            p2.UpdateSocialLinks("https://linkedin.com/in/john-doe-ai", "https://github.com/johndoe-ai",
                "https://johndoe.ai", null, null, null, "https://twitter.com/johndoe_dev");
            p2.UpdateJobPreferences("AI Engineer, Senior Backend Developer, ML Engineer", "San Francisco, Remote, London",
                18000m, "USD", "Full-time", "Remote", "60 Days", true, true);
            p2.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/john_doe_cv.pdf");
            p2.ReplaceSkills(new[]
            {
                new SkillAssignment(skillPython.Id, "Expert"), new SkillAssignment(skillCSharp.Id, "Expert"),
                new SkillAssignment(skillDotNet.Id, "Advanced"), new SkillAssignment(skillGemini.Id, "Expert"),
                new SkillAssignment(skillML.Id, "Advanced"), new SkillAssignment(skillPostgres.Id, "Advanced"),
                new SkillAssignment(skillDocker.Id, "Intermediate"), new SkillAssignment(skillJava.Id, "Advanced"),
            });

            // --- Profile 3: Jane Smith (jane.smith@) ---
            var p3 = CandidateProfile.Create(janeUser.Id,
                "Frontend UI/UX Architect focused on accessible Web Applications, TailwindCSS, React performance, and modern Web design systems. Expert in design tokens, component libraries, and micro-animations.",
                4.0m, "Jane", "Frontend Architect | React & Design Systems", "Senior Frontend Engineer", "PixelCraft Studios");
            p3.UpdatePersonalInfo("Jane", null, new DateTime(1997, 11, 8), "Female", "British",
                "12 Camden High Street", "London", "United Kingdom", "NW1 0JH", "Europe/London");
            p3.UpdateSocialLinks("https://linkedin.com/in/jane-smith-frontend", "https://github.com/janesmith-ui",
                "https://janesmith.design", null, "https://behance.net/janesmith", null, null);
            p3.UpdateJobPreferences("Frontend Architect, UI Engineer, Lead Frontend Developer", "London, Remote, Berlin",
                14000m, "GBP", "Full-time", "Hybrid", "30 Days", false, true);
            p3.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/jane_smith_cv.pdf");
            p3.ReplaceSkills(new[]
            {
                new SkillAssignment(skillReact.Id, "Expert"), new SkillAssignment(skillTs.Id, "Expert"),
                new SkillAssignment(skillTailwind.Id, "Expert"), new SkillAssignment(skillFigma.Id, "Expert"),
                new SkillAssignment(skillNode.Id, "Intermediate"), new SkillAssignment(skillGraphQL.Id, "Advanced"),
            });

            // --- Profile 4: Alex Johnson (alex.developer@) ---
            var p4 = CandidateProfile.Create(alexUser.Id,
                "Passionate Full Stack Engineer with expertise in C#, EF Core, PostgreSQL, and Docker containerization. Building scalable SaaS platforms and enterprise REST APIs.",
                3.0m, "Alex", "Full Stack Engineer | .NET & Docker", "Software Engineer", "CloudBridge Technologies");
            p4.UpdatePersonalInfo("Alex", null, new DateTime(1999, 5, 20), "Male", "Canadian",
                "789 Maple Avenue", "Toronto", "Canada", "M5V 2T6", "America/Toronto");
            p4.UpdateSocialLinks("https://linkedin.com/in/alex-johnson-dev", "https://github.com/alex-j-dev",
                null, null, null, null, null);
            p4.UpdateJobPreferences("Full Stack Engineer, .NET Developer", "Toronto, Remote, Vancouver",
                9500m, "CAD", "Full-time", "Remote", "14 Days", true, true);
            p4.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/alex_johnson_cv.pdf");
            p4.ReplaceSkills(new[]
            {
                new SkillAssignment(skillCSharp.Id, "Advanced"), new SkillAssignment(skillDotNet.Id, "Advanced"),
                new SkillAssignment(skillEfCore.Id, "Advanced"), new SkillAssignment(skillReact.Id, "Intermediate"),
                new SkillAssignment(skillDocker.Id, "Advanced"), new SkillAssignment(skillPostgres.Id, "Advanced"),
            });

            // --- Profile 5: Michael Chen (michael.chen@) ---
            var p5 = CandidateProfile.Create(michaelUser.Id,
                "Cloud Infrastructure Architect with 8+ years designing and implementing enterprise-scale cloud solutions on AWS and Azure. Expert in Kubernetes orchestration, Terraform IaC, and zero-downtime deployments.",
                8.0m, "Michael", "Cloud Architect | AWS & Kubernetes", "Principal Cloud Architect", "NimbusCloud Inc.");
            p5.UpdatePersonalInfo("Michael", null, new DateTime(1991, 1, 30), "Male", "Singaporean",
                "88 Robinson Road", "Singapore", "Singapore", "068898", "Asia/Singapore");
            p5.UpdateSocialLinks("https://linkedin.com/in/michael-chen-cloud", "https://github.com/mchen-cloud",
                "https://michaelchen.cloud", null, null, "https://medium.com/@mchen", null);
            p5.UpdateJobPreferences("Cloud Architect, DevOps Lead, SRE Manager", "Singapore, Remote, Sydney",
                22000m, "USD", "Full-time", "Remote", "90 Days", true, true);
            p5.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/michael_chen_cv.pdf");
            p5.ReplaceSkills(new[]
            {
                new SkillAssignment(skillAws.Id, "Expert"), new SkillAssignment(skillAzure.Id, "Expert"),
                new SkillAssignment(skillK8s.Id, "Expert"), new SkillAssignment(skillDocker.Id, "Expert"),
                new SkillAssignment(skillSysDesign.Id, "Expert"), new SkillAssignment(skillGo.Id, "Advanced"),
                new SkillAssignment(skillPython.Id, "Intermediate"), new SkillAssignment(skillRedis.Id, "Advanced"),
            });

            // --- Profile 6: Sarah Kumar (sarah.kumar@) ---
            var p6 = CandidateProfile.Create(sarahUser.Id,
                "Data Scientist and ML Engineer with 5+ years experience building predictive models, NLP pipelines, and real-time recommendation systems. Published researcher in applied machine learning.",
                5.0m, "Sarah", "Data Scientist | ML & NLP", "Senior Data Scientist", "DataPulse Analytics");
            p6.UpdatePersonalInfo("Sarah", null, new DateTime(1995, 9, 12), "Female", "Indian",
                "23 MG Road", "Bangalore", "India", "560001", "Asia/Kolkata");
            p6.UpdateSocialLinks("https://linkedin.com/in/sarah-kumar-ml", "https://github.com/sarah-ml",
                null, null, null, "https://medium.com/@sarahkumar", null);
            p6.UpdateJobPreferences("Data Scientist, ML Engineer, AI Researcher", "Bangalore, Remote, London",
                16000m, "USD", "Full-time", "Hybrid", "60 Days", true, true);
            p6.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/sarah_kumar_cv.pdf");
            p6.ReplaceSkills(new[]
            {
                new SkillAssignment(skillPython.Id, "Expert"), new SkillAssignment(skillML.Id, "Expert"),
                new SkillAssignment(skillSql.Id, "Advanced"), new SkillAssignment(skillPostgres.Id, "Advanced"),
                new SkillAssignment(skillAws.Id, "Intermediate"), new SkillAssignment(skillDocker.Id, "Intermediate"),
            });

            // --- Profile 7: David Wilson (david.wilson@) ---
            var p7 = CandidateProfile.Create(davidUser.Id,
                "DevOps Engineer with 7+ years experience in CI/CD automation, infrastructure as code, and site reliability engineering. Strong background in observability platforms and incident response.",
                7.0m, "David", "DevOps Engineer | CI/CD & SRE", "Senior DevOps Engineer", "ReliOps Engineering");
            p7.UpdatePersonalInfo("David", null, new DateTime(1993, 4, 5), "Male", "Australian",
                "15 Collins Street", "Melbourne", "Australia", "3000", "Australia/Melbourne");
            p7.UpdateSocialLinks("https://linkedin.com/in/david-wilson-devops", "https://github.com/dwilson-ops",
                null, null, null, null, "https://twitter.com/dwilson_ops");
            p7.UpdateJobPreferences("DevOps Engineer, SRE, Platform Engineer", "Melbourne, Remote, Sydney",
                15000m, "AUD", "Full-time", "Remote", "30 Days", false, true);
            p7.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/david_wilson_cv.pdf");
            p7.ReplaceSkills(new[]
            {
                new SkillAssignment(skillDocker.Id, "Expert"), new SkillAssignment(skillK8s.Id, "Expert"),
                new SkillAssignment(skillAws.Id, "Expert"), new SkillAssignment(skillGo.Id, "Advanced"),
                new SkillAssignment(skillPython.Id, "Advanced"), new SkillAssignment(skillRedis.Id, "Advanced"),
                new SkillAssignment(skillSysDesign.Id, "Advanced"),
            });

            // --- Profile 8: Emma Taylor (emma.taylor@) ---
            var p8 = CandidateProfile.Create(emmaUser.Id,
                "Mobile Developer with 4+ years building cross-platform apps using React Native and Flutter. Experienced in publishing to App Store and Google Play with 500K+ total downloads.",
                4.0m, "Emma", "Mobile Developer | React Native & Flutter", "Mobile App Developer", "AppForge Labs");
            p8.UpdatePersonalInfo("Emma", null, new DateTime(1998, 8, 25), "Female", "German",
                "Friedrichstrasse 45", "Berlin", "Germany", "10117", "Europe/Berlin");
            p8.UpdateSocialLinks("https://linkedin.com/in/emma-taylor-mobile", "https://github.com/emma-mobile",
                "https://emmataylor.dev", null, null, null, null);
            p8.UpdateJobPreferences("Mobile Developer, React Native Engineer", "Berlin, Remote, Amsterdam",
                11000m, "EUR", "Full-time", "Hybrid", "30 Days", true, true);
            p8.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/emma_taylor_cv.pdf");
            p8.ReplaceSkills(new[]
            {
                new SkillAssignment(skillRN.Id, "Expert"), new SkillAssignment(skillReact.Id, "Expert"),
                new SkillAssignment(skillTs.Id, "Expert"), new SkillAssignment(skillNode.Id, "Advanced"),
                new SkillAssignment(skillGraphQL.Id, "Advanced"),
            });

            // --- Profile 9: James Park (james.park@) ---
            var p9 = CandidateProfile.Create(jamesUser.Id,
                "QA Automation Engineer with 6+ years designing comprehensive test suites using Selenium, Cypress, and Playwright. Expert in CI/CD pipeline integration and performance testing.",
                6.0m, "James", "QA Automation Lead | Selenium & Cypress", "Senior QA Engineer", "QualitySphere Inc.");
            p9.UpdatePersonalInfo("James", null, new DateTime(1994, 12, 3), "Male", "Korean",
                "Gangnam-gu", "Seoul", "South Korea", "06134", "Asia/Seoul");
            p9.UpdateSocialLinks("https://linkedin.com/in/james-park-qa", "https://github.com/jpark-qa",
                null, null, null, null, null);
            p9.UpdateJobPreferences("QA Automation Engineer, SDET, Test Architect", "Seoul, Remote, Tokyo",
                13000m, "USD", "Full-time", "Hybrid", "30 Days", true, true);
            p9.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/james_park_cv.pdf");
            p9.ReplaceSkills(new[]
            {
                new SkillAssignment(skillSelenium.Id, "Expert"), new SkillAssignment(skillJava.Id, "Advanced"),
                new SkillAssignment(skillPython.Id, "Advanced"), new SkillAssignment(skillDocker.Id, "Intermediate"),
                new SkillAssignment(skillTs.Id, "Intermediate"), new SkillAssignment(skillAws.Id, "Intermediate"),
            });

            // --- Profile 10: Priya Patel (priya.patel@) ---
            var p10 = CandidateProfile.Create(priyaUser.Id,
                "Backend Developer with 3.5 years experience in Java Spring Boot, ASP.NET Core, and microservice architectures. Strong focus on API design, performance tuning, and database optimization.",
                3.5m, "Priya", "Backend Developer | Java & .NET", "Backend Developer", "MicroStack Systems");
            p10.UpdatePersonalInfo("Priya", null, new DateTime(1998, 6, 18), "Female", "Indian",
                "45 Anna Salai", "Chennai", "India", "600002", "Asia/Kolkata");
            p10.UpdateSocialLinks("https://linkedin.com/in/priya-patel-backend", "https://github.com/priya-backend",
                null, "https://stackoverflow.com/users/priya-patel", null, null, null);
            p10.UpdateJobPreferences("Backend Developer, Java Developer, .NET Developer", "Chennai, Remote, Bangalore",
                8000m, "USD", "Full-time", "Hybrid", "30 Days", true, true);
            p10.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/priya_patel_cv.pdf");
            p10.ReplaceSkills(new[]
            {
                new SkillAssignment(skillJava.Id, "Advanced"), new SkillAssignment(skillCSharp.Id, "Advanced"),
                new SkillAssignment(skillDotNet.Id, "Intermediate"), new SkillAssignment(skillSql.Id, "Advanced"),
                new SkillAssignment(skillPostgres.Id, "Advanced"), new SkillAssignment(skillRedis.Id, "Intermediate"),
                new SkillAssignment(skillDocker.Id, "Intermediate"),
            });

            // --- Profile 11: Tom Anderson (tom.anderson@) ---
            var p11 = CandidateProfile.Create(tomUser.Id,
                "UI/UX Designer with 5+ years crafting intuitive design systems, interactive prototypes, and accessible user experiences for SaaS products. Expert in Figma, design tokens, and user research methodologies.",
                5.0m, "Tom", "UI/UX Designer | Design Systems & Prototyping", "Senior UI/UX Designer", "DesignFlow Agency");
            p11.UpdatePersonalInfo("Tom", null, new DateTime(1996, 2, 14), "Male", "Dutch",
                "Keizersgracht 123", "Amsterdam", "Netherlands", "1015 CJ", "Europe/Amsterdam");
            p11.UpdateSocialLinks("https://linkedin.com/in/tom-anderson-design", null,
                "https://tomanderson.design", null, "https://behance.net/tomanderson", null, "https://twitter.com/tom_designs");
            p11.UpdateJobPreferences("UI/UX Designer, Product Designer, Design Lead", "Amsterdam, Remote, Berlin",
                10000m, "EUR", "Full-time", "Hybrid", "30 Days", true, true);
            p11.SetResumeUrl("https://talentiqstorage.blob.core.windows.net/resumes/tom_anderson_cv.pdf");
            p11.ReplaceSkills(new[]
            {
                new SkillAssignment(skillFigma.Id, "Expert"), new SkillAssignment(skillReact.Id, "Intermediate"),
                new SkillAssignment(skillTs.Id, "Beginner"), new SkillAssignment(skillTailwind.Id, "Advanced"),
            });

            await candidateDb.CandidateProfiles.AddRangeAsync(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded 11 candidate profiles with full details");
        }

        // Query back all profiles
        var profileKavinda = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == candidateUser.Id);
        var profileJohn = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == johnUser.Id);
        var profileJane = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == janeUser.Id);
        var profileAlex = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == alexUser.Id);
        var profileMichael = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == michaelUser.Id);
        var profileSarah = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == sarahUser.Id);
        var profileDavid = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == davidUser.Id);
        var profileEmma = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == emmaUser.Id);
        var profileJames = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == jamesUser.Id);
        var profilePriya = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == priyaUser.Id);
        var profileTom = await candidateDb.CandidateProfiles.FirstAsync(p => p.UserId == tomUser.Id);

        var allProfiles = new[] { profileKavinda, profileJohn, profileJane, profileAlex, profileMichael, profileSarah, profileDavid, profileEmma, profileJames, profilePriya, profileTom };

        // ════════════════════════════════════════════════════════════════
        // 5. CANDIDATE EXPERIENCES (~33 entries)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateExperiences.AnyAsync())
        {
            var experiences = new List<CandidateExperience>
            {
                // Kavinda (3)
                new(profileKavinda.Id, "TechCorp Solutions", "Senior Full Stack Developer", "Full-time", "Colombo, Sri Lanka",
                    DateTime.UtcNow.AddYears(-3), null, true,
                    "Lead development of microservice-based recruitment platform. Architect React 19 frontend with design token system. Mentor team of 4 junior developers.",
                    "Reduced page load time by 60%. Increased test coverage from 40% to 92%.",
                    "React, TypeScript, C#, ASP.NET Core, SQL Server, Docker, Azure"),
                new(profileKavinda.Id, "Digital Dynamics", "Full Stack Developer", "Full-time", "Kandy, Sri Lanka",
                    DateTime.UtcNow.AddYears(-5), DateTime.UtcNow.AddYears(-3), false,
                    "Developed enterprise CRM system using .NET 6 and Angular. Implemented RESTful APIs serving 10K+ daily users.",
                    "Delivered project 2 weeks ahead of schedule. Built reusable component library adopted by 3 teams.",
                    "C#, .NET 6, Angular, SQL Server, RabbitMQ"),
                new(profileKavinda.Id, "StartupHub Lanka", "Junior Developer", "Full-time", "Colombo, Sri Lanka",
                    DateTime.UtcNow.AddYears(-6).AddMonths(-6), DateTime.UtcNow.AddYears(-5), false,
                    "Built responsive web applications and REST APIs. Participated in agile sprints and code reviews.",
                    "Promoted to mid-level developer within 8 months.",
                    "JavaScript, React, Node.js, MongoDB"),

                // John (3)
                new(profileJohn.Id, "IntelliSoft Labs", "AI Integration Lead", "Full-time", "San Francisco, CA",
                    DateTime.UtcNow.AddYears(-2), null, true,
                    "Lead team integrating Gemini and GPT models into enterprise products. Design AI-powered candidate matching algorithms. Architect RAG pipelines for document analysis.",
                    "Improved AI match accuracy by 34%. Reduced inference latency from 2.1s to 0.4s.",
                    "Python, Gemini API, LangChain, FastAPI, PostgreSQL, Docker"),
                new(profileJohn.Id, "DataBridge Systems", "Senior Backend Developer", "Full-time", "New York, NY",
                    DateTime.UtcNow.AddYears(-5), DateTime.UtcNow.AddYears(-2), false,
                    "Designed high-throughput event-driven microservices processing 50K events/minute. Built real-time analytics pipelines.",
                    "Achieved 99.99% uptime SLA for core payment services.",
                    "C#, ASP.NET Core, Kafka, Redis, SQL Server"),
                new(profileJohn.Id, "CodeWave Inc.", "Software Developer", "Full-time", "Austin, TX",
                    DateTime.UtcNow.AddYears(-7), DateTime.UtcNow.AddYears(-5), false,
                    "Developed RESTful APIs and background job processing systems. Implemented OAuth2 authentication flows.",
                    "Built automated deployment pipeline reducing release time from 4 hours to 15 minutes.",
                    "Java, Spring Boot, MySQL, Jenkins"),

                // Jane (3)
                new(profileJane.Id, "PixelCraft Studios", "Senior Frontend Engineer", "Full-time", "London, UK",
                    DateTime.UtcNow.AddYears(-2), null, true,
                    "Architect enterprise design system with 80+ components. Lead frontend performance optimization initiative. Establish accessibility standards.",
                    "Reduced bundle size by 45%. Achieved WCAG 2.1 AA compliance across all products.",
                    "React, TypeScript, TailwindCSS, Storybook, Figma, Playwright"),
                new(profileJane.Id, "WebSphere Agency", "Frontend Developer", "Full-time", "Manchester, UK",
                    DateTime.UtcNow.AddYears(-4), DateTime.UtcNow.AddYears(-2), false,
                    "Built responsive e-commerce platforms and marketing websites. Implemented A/B testing frameworks.",
                    "Increased conversion rate by 22% through UI/UX improvements.",
                    "React, Vue.js, Sass, GraphQL, Node.js"),
                new(profileJane.Id, "CreativeBytes", "Junior Web Developer", "Full-time", "London, UK",
                    DateTime.UtcNow.AddYears(-5), DateTime.UtcNow.AddYears(-4), false,
                    "Developed responsive web pages and interactive UI components. Collaborated with design team on prototypes.",
                    "Received 'Rising Star' award in first year.",
                    "HTML, CSS, JavaScript, React, Bootstrap"),

                // Alex (3)
                new(profileAlex.Id, "CloudBridge Technologies", "Software Engineer", "Full-time", "Toronto, Canada",
                    DateTime.UtcNow.AddYears(-2), null, true,
                    "Build SaaS platform backend using ASP.NET Core and EF Core. Implement multi-tenant architecture with PostgreSQL.",
                    "Onboarded 50+ enterprise clients on the platform.",
                    "C#, ASP.NET Core, EF Core, PostgreSQL, Docker, Redis"),
                new(profileAlex.Id, "NovaTech Solutions", "Junior Developer", "Full-time", "Vancouver, Canada",
                    DateTime.UtcNow.AddYears(-3).AddMonths(-6), DateTime.UtcNow.AddYears(-2), false,
                    "Developed internal tools and admin dashboards. Wrote unit and integration tests.",
                    "Automated manual reporting process, saving 20 hours/week.",
                    "C#, .NET 6, React, SQL Server"),
                new(profileAlex.Id, "Freelance", "Web Developer", "Contract", "Remote",
                    DateTime.UtcNow.AddYears(-4), DateTime.UtcNow.AddYears(-3).AddMonths(-6), false,
                    "Built websites and web applications for small businesses. Managed client relationships and project timelines.",
                    "Delivered 12 projects with 100% client satisfaction.",
                    "React, Node.js, MongoDB, Heroku"),

                // Michael (3)
                new(profileMichael.Id, "NimbusCloud Inc.", "Principal Cloud Architect", "Full-time", "Singapore",
                    DateTime.UtcNow.AddYears(-3), null, true,
                    "Design multi-region cloud architectures for enterprise clients. Lead cloud migration projects worth $5M+. Establish cloud governance frameworks.",
                    "Reduced cloud infrastructure costs by 40% through right-sizing and reserved instances.",
                    "AWS, Azure, Kubernetes, Terraform, Go, Python"),
                new(profileMichael.Id, "ScaleOps Global", "Senior DevOps Engineer", "Full-time", "Singapore",
                    DateTime.UtcNow.AddYears(-6), DateTime.UtcNow.AddYears(-3), false,
                    "Built and maintained Kubernetes clusters serving 10M+ daily requests. Implemented GitOps workflows.",
                    "Achieved 99.99% platform availability. Reduced deployment frequency from weekly to hourly.",
                    "Kubernetes, Docker, AWS, Ansible, Prometheus, Grafana"),
                new(profileMichael.Id, "TechVault Systems", "Systems Engineer", "Full-time", "Singapore",
                    DateTime.UtcNow.AddYears(-8), DateTime.UtcNow.AddYears(-6), false,
                    "Managed on-premise and cloud hybrid infrastructure. Automated server provisioning and configuration.",
                    "Migrated 200+ servers to AWS with zero downtime.",
                    "Linux, AWS, Docker, Python, Bash"),

                // Sarah (3)
                new(profileSarah.Id, "DataPulse Analytics", "Senior Data Scientist", "Full-time", "Bangalore, India",
                    DateTime.UtcNow.AddYears(-2), null, true,
                    "Build predictive models for customer churn, demand forecasting, and recommendation systems. Lead NLP team developing text classification pipelines.",
                    "Improved churn prediction accuracy from 72% to 91%. Published 2 papers at ICML.",
                    "Python, TensorFlow, PyTorch, SQL, Spark, AWS SageMaker"),
                new(profileSarah.Id, "InsightML Corp.", "Data Scientist", "Full-time", "Mumbai, India",
                    DateTime.UtcNow.AddYears(-4), DateTime.UtcNow.AddYears(-2), false,
                    "Developed fraud detection models for financial services. Built ETL pipelines processing 100GB+ daily.",
                    "Detected $2.3M in fraudulent transactions in first quarter of deployment.",
                    "Python, Scikit-learn, Pandas, PostgreSQL, Airflow"),
                new(profileSarah.Id, "Research Lab, IIT Bombay", "Research Assistant", "Internship", "Mumbai, India",
                    DateTime.UtcNow.AddYears(-5), DateTime.UtcNow.AddYears(-4), false,
                    "Conducted research on neural network architectures for time-series prediction.",
                    "Co-authored paper published in IEEE Transactions.",
                    "Python, TensorFlow, R, MATLAB"),

                // David (3)
                new(profileDavid.Id, "ReliOps Engineering", "Senior DevOps Engineer", "Full-time", "Melbourne, Australia",
                    DateTime.UtcNow.AddYears(-3), null, true,
                    "Design and maintain CI/CD pipelines for 40+ microservices. Implement observability stack with Prometheus, Grafana, and ELK.",
                    "Reduced mean time to recovery from 45 minutes to 5 minutes.",
                    "Kubernetes, Docker, AWS, Terraform, Go, Prometheus"),
                new(profileDavid.Id, "CloudNative Solutions", "DevOps Engineer", "Full-time", "Sydney, Australia",
                    DateTime.UtcNow.AddYears(-5), DateTime.UtcNow.AddYears(-3), false,
                    "Built automated testing and deployment infrastructure. Managed production Kubernetes clusters.",
                    "Implemented canary deployment strategy reducing production incidents by 65%.",
                    "Docker, Kubernetes, Jenkins, AWS, Python"),
                new(profileDavid.Id, "NetOps Australia", "Systems Administrator", "Full-time", "Sydney, Australia",
                    DateTime.UtcNow.AddYears(-7), DateTime.UtcNow.AddYears(-5), false,
                    "Managed Linux server fleet of 500+ machines. Automated patch management and security compliance.",
                    "Achieved SOC2 compliance for the entire infrastructure.",
                    "Linux, Ansible, Nagios, Python, Bash"),

                // Emma (3)
                new(profileEmma.Id, "AppForge Labs", "Mobile App Developer", "Full-time", "Berlin, Germany",
                    DateTime.UtcNow.AddYears(-2), null, true,
                    "Build cross-platform mobile apps using React Native. Implement offline-first architecture and push notifications.",
                    "Published 3 apps with combined 500K+ downloads and 4.7 average rating.",
                    "React Native, TypeScript, Redux, Firebase, GraphQL"),
                new(profileEmma.Id, "MobileFirst GmbH", "Junior Mobile Developer", "Full-time", "Munich, Germany",
                    DateTime.UtcNow.AddYears(-4), DateTime.UtcNow.AddYears(-2), false,
                    "Developed Android and iOS apps using React Native. Integrated payment gateways and analytics SDKs.",
                    "Reduced app crash rate from 3.2% to 0.1%.",
                    "React Native, JavaScript, Java, Swift"),
                new(profileEmma.Id, "TechStart Berlin", "Frontend Intern", "Internship", "Berlin, Germany",
                    DateTime.UtcNow.AddYears(-4).AddMonths(-6), DateTime.UtcNow.AddYears(-4), false,
                    "Built responsive web interfaces and contributed to open-source component library.",
                    "Contributed 15 PRs to open-source project with 2K+ stars.",
                    "React, JavaScript, CSS, Git"),

                // James (3)
                new(profileJames.Id, "QualitySphere Inc.", "Senior QA Engineer", "Full-time", "Seoul, South Korea",
                    DateTime.UtcNow.AddYears(-3), null, true,
                    "Design comprehensive test automation frameworks using Selenium and Playwright. Lead QA team of 6 engineers.",
                    "Reduced regression testing time from 8 hours to 45 minutes through parallel test execution.",
                    "Selenium, Playwright, Java, Python, Docker, Jenkins"),
                new(profileJames.Id, "TestPro Solutions", "QA Automation Engineer", "Full-time", "Seoul, South Korea",
                    DateTime.UtcNow.AddYears(-5), DateTime.UtcNow.AddYears(-3), false,
                    "Built end-to-end test suites for e-commerce platform. Implemented visual regression testing.",
                    "Achieved 95% automated test coverage for critical user flows.",
                    "Selenium, Cypress, Java, REST Assured"),
                new(profileJames.Id, "KoreanSoft", "QA Analyst", "Full-time", "Seoul, South Korea",
                    DateTime.UtcNow.AddYears(-6), DateTime.UtcNow.AddYears(-5), false,
                    "Performed manual and exploratory testing. Created test plans and documented defects.",
                    "Identified 200+ critical bugs before production release.",
                    "JIRA, TestRail, SQL, Postman"),

                // Priya (3)
                new(profilePriya.Id, "MicroStack Systems", "Backend Developer", "Full-time", "Chennai, India",
                    DateTime.UtcNow.AddYears(-2), null, true,
                    "Develop microservice APIs using Java Spring Boot and ASP.NET Core. Design database schemas and optimize query performance.",
                    "Reduced API response time by 55% through query optimization and caching.",
                    "Java, Spring Boot, C#, ASP.NET Core, PostgreSQL, Redis"),
                new(profilePriya.Id, "ByteForce Technologies", "Junior Backend Developer", "Full-time", "Bangalore, India",
                    DateTime.UtcNow.AddYears(-3).AddMonths(-6), DateTime.UtcNow.AddYears(-2), false,
                    "Built RESTful APIs and background workers. Implemented message queue consumers.",
                    "Designed and launched notification service handling 1M+ messages/day.",
                    "Java, Spring Boot, RabbitMQ, MySQL"),
                new(profilePriya.Id, "Infosys", "Graduate Trainee", "Full-time", "Mysore, India",
                    DateTime.UtcNow.AddYears(-4), DateTime.UtcNow.AddYears(-3).AddMonths(-6), false,
                    "Completed intensive training in Java, databases, and software engineering principles. Contributed to client projects.",
                    "Ranked top 5% in training batch of 200 trainees.",
                    "Java, Oracle SQL, HTML, CSS"),

                // Tom (3)
                new(profileTom.Id, "DesignFlow Agency", "Senior UI/UX Designer", "Full-time", "Amsterdam, Netherlands",
                    DateTime.UtcNow.AddYears(-2), null, true,
                    "Create design systems and interactive prototypes for enterprise SaaS products. Conduct user research and usability testing.",
                    "Increased user task completion rate by 35% through iterative design improvements.",
                    "Figma, Sketch, Adobe XD, TailwindCSS, React (prototyping)"),
                new(profileTom.Id, "UXStudio Berlin", "UI/UX Designer", "Full-time", "Berlin, Germany",
                    DateTime.UtcNow.AddYears(-4), DateTime.UtcNow.AddYears(-2), false,
                    "Designed mobile and web interfaces for fintech and healthcare startups. Created wireframes, high-fidelity mockups, and design specifications.",
                    "Won German Design Award 2024 for healthcare app redesign.",
                    "Figma, InVision, Principle, CSS"),
                new(profileTom.Id, "CreativeMinds", "Junior Designer", "Full-time", "Rotterdam, Netherlands",
                    DateTime.UtcNow.AddYears(-5), DateTime.UtcNow.AddYears(-4), false,
                    "Assisted senior designers with web and print design projects. Created marketing materials and social media graphics.",
                    "Designed brand identity for 8 startup clients.",
                    "Photoshop, Illustrator, Figma, HTML, CSS"),
            };
            await candidateDb.CandidateExperiences.AddRangeAsync(experiences);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} candidate experiences", experiences.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 6. CANDIDATE EDUCATION (~22 entries)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateEducations.AnyAsync())
        {
            var educations = new List<CandidateEducation>
            {
                new(profileKavinda.Id, "University of Moratuwa", "BSc (Hons)", "Computer Science & Engineering", "3.8/4.0",
                    new DateTime(2014, 9, 1), new DateTime(2018, 6, 30), "First Class Honours. Final year project on distributed microservice architectures."),
                new(profileKavinda.Id, "NSBM Green University", "Professional Certificate", "Cloud Architecture", "Distinction",
                    new DateTime(2019, 1, 1), new DateTime(2019, 6, 30), "Intensive 6-month program covering AWS, Azure, and GCP."),

                new(profileJohn.Id, "Stanford University", "MSc", "Artificial Intelligence", "3.9/4.0",
                    new DateTime(2016, 9, 1), new DateTime(2018, 6, 30), "Thesis on transformer architectures for recruitment matching. Research assistant under Prof. Andrew Ng."),
                new(profileJohn.Id, "University of California, Berkeley", "BSc", "Computer Science", "3.7/4.0",
                    new DateTime(2012, 9, 1), new DateTime(2016, 6, 30), "Dean's List all semesters. Teaching assistant for Data Structures course."),

                new(profileJane.Id, "Imperial College London", "MEng", "Computing", "First Class",
                    new DateTime(2015, 9, 1), new DateTime(2019, 6, 30), "Integrated Masters with specialization in Human-Computer Interaction."),
                new(profileJane.Id, "Coursera / Google", "Professional Certificate", "UX Design", "Completed",
                    new DateTime(2020, 1, 1), new DateTime(2020, 6, 30), "Google UX Design Professional Certificate - 7 courses."),

                new(profileAlex.Id, "University of Toronto", "BSc", "Software Engineering", "3.5/4.0",
                    new DateTime(2017, 9, 1), new DateTime(2021, 6, 30), "Co-op program with 3 industry placements. Capstone project on real-time collaboration tools."),

                new(profileMichael.Id, "National University of Singapore", "MSc", "Cloud Computing & Virtualisation", "Distinction",
                    new DateTime(2013, 8, 1), new DateTime(2015, 5, 30), "Research on container orchestration and auto-scaling algorithms."),
                new(profileMichael.Id, "Nanyang Technological University", "BEng", "Computer Engineering", "First Class Honours",
                    new DateTime(2009, 8, 1), new DateTime(2013, 5, 30), "President of the ACM Student Chapter. Won inter-university hackathon 2012."),

                new(profileSarah.Id, "IIT Bombay", "MTech", "Data Science & Machine Learning", "9.2/10.0",
                    new DateTime(2017, 7, 1), new DateTime(2019, 6, 30), "Thesis on attention-based models for time-series forecasting."),
                new(profileSarah.Id, "BITS Pilani", "BE", "Computer Science", "8.5/10.0",
                    new DateTime(2013, 8, 1), new DateTime(2017, 6, 30), "Minor in Mathematics. Won Best Project Award for NLP chatbot."),

                new(profileDavid.Id, "University of Melbourne", "BSc", "Information Technology", "High Distinction",
                    new DateTime(2012, 2, 1), new DateTime(2015, 11, 30), "Major in Networks and Security. Industry project with Telstra."),
                new(profileDavid.Id, "AWS Training", "Professional Certification", "Solutions Architecture", "Certified",
                    new DateTime(2018, 1, 1), new DateTime(2018, 3, 30), "AWS Solutions Architect Professional preparation program."),

                new(profileEmma.Id, "Technical University of Munich", "BSc", "Informatics", "1.3 (Very Good)",
                    new DateTime(2016, 10, 1), new DateTime(2020, 3, 30), "Focus on mobile computing and HCI. Exchange semester at ETH Zurich."),
                new(profileEmma.Id, "Udacity", "Nanodegree", "React Native Development", "Completed",
                    new DateTime(2020, 6, 1), new DateTime(2020, 12, 30), "Built 3 capstone mobile applications."),

                new(profileJames.Id, "Korea University", "BSc", "Computer Science", "3.8/4.0",
                    new DateTime(2014, 3, 1), new DateTime(2018, 2, 28), "Specialization in Software Quality Engineering. Student council member."),
                new(profileJames.Id, "ISTQB", "Advanced Level", "Test Automation Engineering", "Certified",
                    new DateTime(2020, 1, 1), new DateTime(2020, 3, 30), "International Software Testing Qualifications Board certification."),

                new(profilePriya.Id, "Anna University", "BE", "Computer Science & Engineering", "8.8/10.0",
                    new DateTime(2016, 8, 1), new DateTime(2020, 5, 30), "Gold medalist. Published paper on microservice decomposition patterns."),
                new(profilePriya.Id, "NPTEL", "Professional Certificate", "Database Management Systems", "Elite + Gold",
                    new DateTime(2019, 1, 1), new DateTime(2019, 4, 30), "Top 1% among 50,000 participants nationwide."),

                new(profileTom.Id, "Amsterdam University of Applied Sciences", "BSc", "Communication and Multimedia Design", "Cum Laude",
                    new DateTime(2014, 9, 1), new DateTime(2018, 6, 30), "Focus on interaction design and user experience. Minor in Psychology."),
                new(profileTom.Id, "Interaction Design Foundation", "Professional Certificate", "UX Management", "Completed",
                    new DateTime(2021, 1, 1), new DateTime(2021, 6, 30), "Leadership-focused UX design management program."),
            };
            await candidateDb.CandidateEducations.AddRangeAsync(educations);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} candidate educations", educations.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 7. CANDIDATE CERTIFICATIONS (~18 entries)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateCertifications.AnyAsync())
        {
            var certs = new List<CandidateCertification>
            {
                new(profileKavinda.Id, "Microsoft Certified: Azure Developer Associate", "Microsoft", new DateTime(2023, 5, 15), new DateTime(2026, 5, 15), "AZ-204-2023-KP", "https://learn.microsoft.com/certifications/azure-developer"),
                new(profileKavinda.Id, "AWS Certified Solutions Architect – Associate", "Amazon Web Services", new DateTime(2023, 8, 20), new DateTime(2026, 8, 20), "AWS-SAA-2023-KP", "https://aws.amazon.com/certification/certified-solutions-architect-associate"),

                new(profileJohn.Id, "Google Cloud Professional Machine Learning Engineer", "Google Cloud", new DateTime(2023, 3, 10), new DateTime(2025, 3, 10), "GCP-PMLE-2023-JD", "https://cloud.google.com/certification/machine-learning-engineer"),
                new(profileJohn.Id, "TensorFlow Developer Certificate", "Google", new DateTime(2022, 11, 1), null, "TF-DEV-2022-JD", "https://www.tensorflow.org/certificate"),

                new(profileJane.Id, "Meta Front-End Developer Professional Certificate", "Meta", new DateTime(2023, 6, 1), null, "META-FED-2023-JS", "https://www.coursera.org/professional-certificates/meta-front-end-developer"),
                new(profileJane.Id, "Google UX Design Professional Certificate", "Google", new DateTime(2022, 8, 15), null, "GUXD-2022-JS", "https://grow.google/certificates/ux-design"),

                new(profileAlex.Id, "Microsoft Certified: Azure Fundamentals", "Microsoft", new DateTime(2023, 2, 1), null, "AZ-900-2023-AJ", "https://learn.microsoft.com/certifications/azure-fundamentals"),

                new(profileMichael.Id, "AWS Certified Solutions Architect – Professional", "Amazon Web Services", new DateTime(2023, 1, 15), new DateTime(2026, 1, 15), "AWS-SAP-2023-MC", "https://aws.amazon.com/certification/certified-solutions-architect-professional"),
                new(profileMichael.Id, "Certified Kubernetes Administrator (CKA)", "CNCF", new DateTime(2022, 6, 1), new DateTime(2025, 6, 1), "CKA-2022-MC", "https://www.cncf.io/certification/cka"),
                new(profileMichael.Id, "HashiCorp Certified: Terraform Associate", "HashiCorp", new DateTime(2023, 4, 1), new DateTime(2025, 4, 1), "HCT-2023-MC", "https://www.hashicorp.com/certification/terraform-associate"),

                new(profileSarah.Id, "AWS Certified Machine Learning – Specialty", "Amazon Web Services", new DateTime(2023, 7, 20), new DateTime(2026, 7, 20), "AWS-MLS-2023-SK", "https://aws.amazon.com/certification/certified-machine-learning-specialty"),
                new(profileSarah.Id, "Deep Learning Specialization", "Coursera / deeplearning.ai", new DateTime(2021, 12, 1), null, "DLS-2021-SK", "https://www.coursera.org/specializations/deep-learning"),

                new(profileDavid.Id, "AWS Certified DevOps Engineer – Professional", "Amazon Web Services", new DateTime(2023, 9, 1), new DateTime(2026, 9, 1), "AWS-DOP-2023-DW", "https://aws.amazon.com/certification/certified-devops-engineer-professional"),
                new(profileDavid.Id, "Certified Kubernetes Security Specialist (CKS)", "CNCF", new DateTime(2023, 5, 1), new DateTime(2025, 5, 1), "CKS-2023-DW", "https://www.cncf.io/certification/cks"),

                new(profileEmma.Id, "React Native Specialist Certificate", "Udacity", new DateTime(2022, 12, 1), null, "UDACITY-RN-2022-ET", "https://www.udacity.com/course/react-native-nanodegree"),

                new(profileJames.Id, "ISTQB Advanced Level Test Automation Engineer", "ISTQB", new DateTime(2022, 3, 1), null, "ISTQB-ATA-2022-JP", "https://www.istqb.org/certifications/test-automation-engineer"),
                new(profileJames.Id, "AWS Certified Developer – Associate", "Amazon Web Services", new DateTime(2023, 10, 1), new DateTime(2026, 10, 1), "AWS-DVA-2023-JP", "https://aws.amazon.com/certification/certified-developer-associate"),

                new(profilePriya.Id, "Oracle Certified Professional: Java SE 17 Developer", "Oracle", new DateTime(2023, 4, 15), null, "OCP-JAVA17-2023-PP", "https://education.oracle.com/java-se-17-developer"),
            };
            await candidateDb.CandidateCertifications.AddRangeAsync(certs);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} candidate certifications", certs.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 8. CANDIDATE PROJECTS (~18 entries)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateProjects.AnyAsync())
        {
            var projects = new List<CandidateProject>
            {
                new(profileKavinda.Id, "TalentIQ Platform", "AI-powered recruitment platform with intelligent candidate matching and automated interview scheduling.", "Lead Developer",
                    "React 19, TypeScript, C#, ASP.NET Core, SQL Server, Docker", "https://github.com/kavinda/talentiq", "https://talentiq-demo.azurewebsites.net",
                    DateTime.UtcNow.AddYears(-1), null),
                new(profileKavinda.Id, "DevPortfolio Generator", "Open-source CLI tool that generates beautiful developer portfolio websites from GitHub profiles.", "Creator & Maintainer",
                    "Node.js, TypeScript, React, GitHub API", "https://github.com/kavinda/devportfolio-gen", "https://devportfolio.io",
                    DateTime.UtcNow.AddYears(-2), DateTime.UtcNow.AddYears(-1)),

                new(profileJohn.Id, "SmartRecruit AI", "AI-powered resume screening engine using Gemini API with explainable matching scores.", "Architect & Developer",
                    "Python, Gemini API, FastAPI, PostgreSQL, Docker", "https://github.com/johndoe/smartrecruit-ai", "",
                    DateTime.UtcNow.AddYears(-1), null),
                new(profileJohn.Id, "NLP Sentiment Dashboard", "Real-time sentiment analysis dashboard for social media monitoring with streaming data processing.", "Lead Developer",
                    "Python, Kafka, Spark, React, D3.js", "https://github.com/johndoe/sentiment-dash", "https://sentiment-demo.herokuapp.com",
                    DateTime.UtcNow.AddYears(-2), DateTime.UtcNow.AddMonths(-6)),

                new(profileJane.Id, "Prism Design System", "Enterprise design system with 80+ accessible React components, design tokens, and Storybook documentation.", "Design System Lead",
                    "React, TypeScript, TailwindCSS, Storybook, Chromatic", "https://github.com/janesmith/prism-ds", "https://prism-ds.vercel.app",
                    DateTime.UtcNow.AddYears(-1).AddMonths(-6), null),

                new(profileAlex.Id, "TaskFlow SaaS", "Multi-tenant project management SaaS application with real-time collaboration features.", "Full Stack Developer",
                    "C#, ASP.NET Core, React, PostgreSQL, SignalR", "https://github.com/alexj/taskflow", "https://taskflow-demo.azurewebsites.net",
                    DateTime.UtcNow.AddYears(-1), null),

                new(profileMichael.Id, "K8s Auto-Scaler", "Custom Kubernetes HPA controller with predictive scaling based on ML-driven traffic forecasting.", "Creator",
                    "Go, Kubernetes, Prometheus, Python, TensorFlow", "https://github.com/mchen/k8s-autoscaler", "",
                    DateTime.UtcNow.AddYears(-1), DateTime.UtcNow.AddMonths(-3)),
                new(profileMichael.Id, "CloudCost Optimizer", "Open-source tool for multi-cloud cost analysis and optimization recommendations.", "Lead Developer",
                    "Go, AWS SDK, Azure SDK, React, PostgreSQL", "https://github.com/mchen/cloudcost", "https://cloudcost.dev",
                    DateTime.UtcNow.AddYears(-2), DateTime.UtcNow.AddMonths(-6)),

                new(profileSarah.Id, "ChurnGuard ML", "Production ML pipeline for customer churn prediction with real-time feature engineering.", "Data Scientist",
                    "Python, XGBoost, Airflow, FastAPI, AWS SageMaker", "https://github.com/sarahml/churnguard", "",
                    DateTime.UtcNow.AddYears(-1), null),
                new(profileSarah.Id, "NeuroBERT Text Classifier", "Fine-tuned BERT model for multi-label document classification with 96% accuracy.", "Researcher",
                    "Python, PyTorch, Hugging Face, Docker", "https://github.com/sarahml/neurobert", "",
                    DateTime.UtcNow.AddYears(-2), DateTime.UtcNow.AddYears(-1)),

                new(profileDavid.Id, "Pipeline Forge", "Declarative CI/CD pipeline generator for multi-cloud deployments.", "Creator & Maintainer",
                    "Go, Docker, Kubernetes, GitHub Actions, Terraform", "https://github.com/dwilson/pipeline-forge", "",
                    DateTime.UtcNow.AddYears(-1), null),

                new(profileEmma.Id, "FitTracker Mobile", "Cross-platform fitness tracking app with workout plans, nutrition tracking, and social features.", "Lead Mobile Developer",
                    "React Native, TypeScript, Firebase, GraphQL", "https://github.com/emma-mobile/fittracker", "",
                    DateTime.UtcNow.AddYears(-1), null),
                new(profileEmma.Id, "TransitGo", "Public transit companion app with real-time route planning and offline maps.", "Developer",
                    "React Native, TypeScript, MapBox SDK, Node.js", "https://github.com/emma-mobile/transitgo", "",
                    DateTime.UtcNow.AddYears(-2), DateTime.UtcNow.AddYears(-1)),

                new(profileJames.Id, "TestBench Framework", "Modular test automation framework with parallel execution and visual reporting.", "Creator",
                    "Java, Selenium, TestNG, Allure, Docker", "https://github.com/jpark-qa/testbench", "",
                    DateTime.UtcNow.AddYears(-1), null),

                new(profilePriya.Id, "API Gateway Lite", "Lightweight API gateway with rate limiting, circuit breaking, and request transformation.", "Developer",
                    "Java, Spring Cloud Gateway, Redis, Docker", "https://github.com/priya-backend/apigw-lite", "",
                    DateTime.UtcNow.AddMonths(-8), null),

                new(profileTom.Id, "DesignOps Toolkit", "Open-source design token management and synchronization tool for design-to-code workflows.", "Designer & Developer",
                    "Figma Plugin API, TypeScript, React", "https://github.com/tomdesigns/designops-toolkit", "https://designops-toolkit.vercel.app",
                    DateTime.UtcNow.AddYears(-1), null),
                new(profileTom.Id, "AccessiCheck", "Automated accessibility audit tool for web applications with WCAG 2.1 compliance reports.", "Creator",
                    "TypeScript, Puppeteer, React, Node.js", "https://github.com/tomdesigns/accessicheck", "https://accessicheck.app",
                    DateTime.UtcNow.AddYears(-2), DateTime.UtcNow.AddMonths(-4)),
            };
            await candidateDb.CandidateProjects.AddRangeAsync(projects);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} candidate projects", projects.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 9. CANDIDATE LANGUAGES (~28 entries)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateLanguages.AnyAsync())
        {
            var languages = new List<CandidateLanguage>
            {
                new(profileKavinda.Id, "English", "Native", "Native", "Native"),
                new(profileKavinda.Id, "Sinhala", "Native", "Native", "Native"),
                new(profileKavinda.Id, "Tamil", "Intermediate", "Beginner", "Intermediate"),

                new(profileJohn.Id, "English", "Native", "Native", "Native"),
                new(profileJohn.Id, "Mandarin", "Intermediate", "Beginner", "Intermediate"),

                new(profileJane.Id, "English", "Native", "Native", "Native"),
                new(profileJane.Id, "French", "Advanced", "Advanced", "Intermediate"),
                new(profileJane.Id, "Spanish", "Intermediate", "Beginner", "Intermediate"),

                new(profileAlex.Id, "English", "Native", "Native", "Native"),
                new(profileAlex.Id, "French", "Advanced", "Advanced", "Advanced"),

                new(profileMichael.Id, "English", "Native", "Native", "Native"),
                new(profileMichael.Id, "Mandarin", "Native", "Native", "Native"),
                new(profileMichael.Id, "Malay", "Intermediate", "Beginner", "Intermediate"),

                new(profileSarah.Id, "English", "Native", "Native", "Native"),
                new(profileSarah.Id, "Hindi", "Native", "Native", "Native"),
                new(profileSarah.Id, "Kannada", "Advanced", "Intermediate", "Advanced"),

                new(profileDavid.Id, "English", "Native", "Native", "Native"),
                new(profileDavid.Id, "Japanese", "Intermediate", "Beginner", "Beginner"),

                new(profileEmma.Id, "German", "Native", "Native", "Native"),
                new(profileEmma.Id, "English", "Native", "Native", "Native"),
                new(profileEmma.Id, "French", "Intermediate", "Intermediate", "Intermediate"),

                new(profileJames.Id, "Korean", "Native", "Native", "Native"),
                new(profileJames.Id, "English", "Advanced", "Advanced", "Advanced"),
                new(profileJames.Id, "Japanese", "Intermediate", "Beginner", "Intermediate"),

                new(profilePriya.Id, "English", "Native", "Native", "Native"),
                new(profilePriya.Id, "Tamil", "Native", "Native", "Native"),
                new(profilePriya.Id, "Hindi", "Advanced", "Intermediate", "Advanced"),

                new(profileTom.Id, "Dutch", "Native", "Native", "Native"),
                new(profileTom.Id, "English", "Native", "Native", "Native"),
                new(profileTom.Id, "German", "Advanced", "Advanced", "Advanced"),
            };
            await candidateDb.CandidateLanguages.AddRangeAsync(languages);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} candidate languages", languages.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 10. CANDIDATE ACHIEVEMENTS (~14 entries)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateAchievements.AnyAsync())
        {
            var achievements = new List<CandidateAchievement>
            {
                new(profileKavinda.Id, "Winner - HackSL 2023 National Hackathon", "Built an AI-powered disaster response coordination platform in 48 hours.", "HackSL Foundation", new DateTime(2023, 11, 15)),
                new(profileKavinda.Id, "Microsoft MVP - Developer Technologies", "Recognized as Microsoft Most Valuable Professional for community contributions.", "Microsoft", new DateTime(2024, 7, 1)),

                new(profileJohn.Id, "Best Paper Award - ACM RecSys 2023", "Paper on transformer-based candidate-job matching achieving SOTA results.", "ACM", new DateTime(2023, 9, 20)),
                new(profileJohn.Id, "Speaker - PyCon US 2024", "Talk on 'Building Production ML Pipelines with Gemini API' to 500+ attendees.", "Python Software Foundation", new DateTime(2024, 4, 18)),

                new(profileJane.Id, "Awwwards Site of the Day", "Recognized for exceptional web design and user experience on client project.", "Awwwards", new DateTime(2024, 2, 10)),

                new(profileMichael.Id, "AWS Community Builder", "Selected as AWS Community Builder for cloud architecture thought leadership.", "Amazon Web Services", new DateTime(2023, 1, 1)),
                new(profileMichael.Id, "Speaker - KubeCon Europe 2024", "Talk on 'Zero-Downtime Multi-Region Kubernetes Migrations' at KubeCon.", "CNCF", new DateTime(2024, 3, 20)),

                new(profileSarah.Id, "Published Researcher - IEEE Transactions", "Co-authored paper on attention-based time-series forecasting models.", "IEEE", new DateTime(2022, 6, 15)),
                new(profileSarah.Id, "Kaggle Competition Master", "Achieved Kaggle Master rank with gold medals in 3 competitions.", "Kaggle", new DateTime(2023, 8, 1)),

                new(profileDavid.Id, "Google Cloud Champion Innovator", "Recognized for contributions to DevOps community and open-source tools.", "Google Cloud", new DateTime(2024, 1, 15)),

                new(profileEmma.Id, "App Store Featured - FitTracker", "FitTracker app featured by Apple in 'Apps We Love' category.", "Apple", new DateTime(2024, 5, 1)),

                new(profileJames.Id, "Speaker - SeleniumConf 2023", "Talk on 'Scaling Test Automation to 10,000 Tests' at SeleniumConf.", "Selenium Project", new DateTime(2023, 10, 5)),

                new(profilePriya.Id, "Gold Medalist - Anna University", "Ranked 1st in Computer Science & Engineering batch of 120 students.", "Anna University", new DateTime(2020, 5, 30)),

                new(profileTom.Id, "German Design Award 2024", "Won award for innovative healthcare app redesign improving patient experience.", "German Design Council", new DateTime(2024, 1, 20)),
            };
            await candidateDb.CandidateAchievements.AddRangeAsync(achievements);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} candidate achievements", achievements.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 11. CANDIDATE DOCUMENTS (~22 entries)
        // ════════════════════════════════════════════════════════════════
        if (!await candidateDb.CandidateDocuments.AnyAsync())
        {
            var docs = new List<CandidateDocument>
            {
                new(profileKavinda.Id, CandidateDocumentType.Resume, "kavinda_perera_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/kavinda_perera_cv.pdf"),
                new(profileKavinda.Id, CandidateDocumentType.CoverLetter, "kavinda_cover_letter.pdf", "https://talentiqstorage.blob.core.windows.net/documents/kavinda_cover_letter.pdf"),
                new(profileJohn.Id, CandidateDocumentType.Resume, "john_doe_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/john_doe_cv.pdf"),
                new(profileJohn.Id, CandidateDocumentType.CoverLetter, "john_doe_cover_letter.pdf", "https://talentiqstorage.blob.core.windows.net/documents/john_doe_cover_letter.pdf"),
                new(profileJohn.Id, CandidateDocumentType.Certification, "john_gcp_ml_cert.pdf", "https://talentiqstorage.blob.core.windows.net/documents/john_gcp_ml_cert.pdf"),
                new(profileJane.Id, CandidateDocumentType.Resume, "jane_smith_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/jane_smith_cv.pdf"),
                new(profileJane.Id, CandidateDocumentType.Portfolio, "jane_portfolio_2024.pdf", "https://talentiqstorage.blob.core.windows.net/documents/jane_portfolio.pdf"),
                new(profileAlex.Id, CandidateDocumentType.Resume, "alex_johnson_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/alex_johnson_cv.pdf"),
                new(profileAlex.Id, CandidateDocumentType.CoverLetter, "alex_cover_letter.pdf", "https://talentiqstorage.blob.core.windows.net/documents/alex_cover_letter.pdf"),
                new(profileMichael.Id, CandidateDocumentType.Resume, "michael_chen_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/michael_chen_cv.pdf"),
                new(profileMichael.Id, CandidateDocumentType.Certification, "michael_aws_sap_cert.pdf", "https://talentiqstorage.blob.core.windows.net/documents/michael_aws_sap.pdf"),
                new(profileMichael.Id, CandidateDocumentType.Certification, "michael_cka_cert.pdf", "https://talentiqstorage.blob.core.windows.net/documents/michael_cka.pdf"),
                new(profileSarah.Id, CandidateDocumentType.Resume, "sarah_kumar_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/sarah_kumar_cv.pdf"),
                new(profileSarah.Id, CandidateDocumentType.SupportingDocument, "sarah_ieee_publication.pdf", "https://talentiqstorage.blob.core.windows.net/documents/sarah_ieee_pub.pdf"),
                new(profileDavid.Id, CandidateDocumentType.Resume, "david_wilson_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/david_wilson_cv.pdf"),
                new(profileDavid.Id, CandidateDocumentType.Certification, "david_aws_devops_cert.pdf", "https://talentiqstorage.blob.core.windows.net/documents/david_aws_devops.pdf"),
                new(profileEmma.Id, CandidateDocumentType.Resume, "emma_taylor_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/emma_taylor_cv.pdf"),
                new(profileEmma.Id, CandidateDocumentType.Portfolio, "emma_app_portfolio.pdf", "https://talentiqstorage.blob.core.windows.net/documents/emma_portfolio.pdf"),
                new(profileJames.Id, CandidateDocumentType.Resume, "james_park_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/james_park_cv.pdf"),
                new(profilePriya.Id, CandidateDocumentType.Resume, "priya_patel_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/priya_patel_cv.pdf"),
                new(profilePriya.Id, CandidateDocumentType.CoverLetter, "priya_cover_letter.pdf", "https://talentiqstorage.blob.core.windows.net/documents/priya_cover_letter.pdf"),
                new(profileTom.Id, CandidateDocumentType.Resume, "tom_anderson_cv_2024.pdf", "https://talentiqstorage.blob.core.windows.net/resumes/tom_anderson_cv.pdf"),
                new(profileTom.Id, CandidateDocumentType.Portfolio, "tom_ux_portfolio_2024.pdf", "https://talentiqstorage.blob.core.windows.net/documents/tom_portfolio.pdf"),
            };
            await candidateDb.CandidateDocuments.AddRangeAsync(docs);
            await candidateDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} candidate documents", docs.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 12. JOB POSTINGS (12 published jobs)
        // ════════════════════════════════════════════════════════════════
        var draftsToPublish = await recruitmentDb.JobPostings.Where(j => j.Status == JobPostingStatus.Draft).ToListAsync();
        foreach (var d in draftsToPublish)
        {
            d.Publish();
        }
        if (draftsToPublish.Any())
        {
            await recruitmentDb.SaveChangesAsync();
        }

        if (!await recruitmentDb.JobPostings.AnyAsync(j => j.Title.Contains("React & Frontend")))
        {
            var jobs = new List<JobPosting>();

            var j1 = JobPosting.Create(defaultOrg.Id, recruiterUser.Id, "Senior React & Frontend Architect",
                "Lead the modernization of frontend web applications using React 19, Vite, TypeScript, and TailwindCSS. Implement high-performance UI components aligned with enterprise design token systems. Establish code quality standards and mentor junior developers.",
                "Colombo, Sri Lanka (Hybrid)", EmploymentType.FullTime, 5);
            j1.Publish(); j1.ReplaceSkills(new[] { skillReact.Id, skillTs.Id, skillTailwind.Id }); jobs.Add(j1);

            var j2 = JobPosting.Create(defaultOrg.Id, recruiterUser.Id, "Full Stack .NET & C# Engineer",
                "Architect scalable web APIs and backend services using ASP.NET Core 8, EF Core, and SQL Server. Build secure identity integrations, implement CQRS patterns, and design microservice endpoints for high-traffic applications.",
                "Remote / Kandy, Sri Lanka", EmploymentType.FullTime, 3);
            j2.Publish(); j2.ReplaceSkills(new[] { skillCSharp.Id, skillDotNet.Id, skillEfCore.Id, skillSql.Id }); jobs.Add(j2);

            var j3 = JobPosting.Create(defaultOrg.Id, recruiterUser.Id, "AI / ML Integration Specialist (Gemini API)",
                "Integrate Gemini LLM models and vector search capabilities into recruitment pipelines. Develop explainable AI match scoring, automated candidate evaluation algorithms, and RAG-based document analysis systems.",
                "Remote (Global)", EmploymentType.FullTime, 3);
            j3.Publish(); j3.ReplaceSkills(new[] { skillPython.Id, skillGemini.Id, skillML.Id }); jobs.Add(j3);

            var j4 = JobPosting.Create(defaultOrg.Id, recruiterUser.Id, "Cloud Infrastructure & DevOps Engineer",
                "Manage cloud infrastructure, CI/CD automation pipelines, Kubernetes clusters, and Docker container orchestration with high availability standards. Design multi-region deployment strategies.",
                "Colombo, Sri Lanka (On-site)", EmploymentType.Contract, 4);
            j4.Publish(); j4.ReplaceSkills(new[] { skillDocker.Id, skillK8s.Id, skillAws.Id }); jobs.Add(j4);

            var j5 = JobPosting.Create(defaultOrg.Id, lisaRecruiter.Id, "UI/UX Product Designer",
                "Design intuitive design systems, interactive prototypes, and design token scales. Conduct user research, accessibility audits, and usability testing for enterprise SaaS applications.",
                "Colombo, Sri Lanka", EmploymentType.FullTime, 2);
            j5.Publish(); j5.ReplaceSkills(new[] { skillFigma.Id, skillTailwind.Id }); jobs.Add(j5);

            var j6 = JobPosting.Create(defaultOrg.Id, recruiterUser.Id, "Data Engineer & Analytics Specialist",
                "Build automated ELT pipelines, design scalable analytics schemas, and implement real-time streaming architectures. Work with Python, SQL, and cloud data platforms.",
                "Remote", EmploymentType.FullTime, 4);
            j6.Publish(); j6.ReplaceSkills(new[] { skillPython.Id, skillSql.Id, skillPostgres.Id, skillAws.Id }); jobs.Add(j6);

            var j7 = JobPosting.Create(defaultOrg.Id, lisaRecruiter.Id, "Mobile App Developer (React Native)",
                "Build and maintain cross-platform mobile applications using React Native. Implement native modules, push notifications, offline-first architecture, and app store deployment pipelines.",
                "Berlin, Germany (Hybrid)", EmploymentType.FullTime, 3);
            j7.Publish(); j7.ReplaceSkills(new[] { skillRN.Id, skillTs.Id, skillReact.Id }); jobs.Add(j7);

            var j8 = JobPosting.Create(defaultOrg.Id, lisaRecruiter.Id, "QA Automation Engineer",
                "Design and implement comprehensive test automation frameworks using Selenium, Playwright, and Cypress. Integrate automated tests into CI/CD pipelines with parallel execution capabilities.",
                "Seoul, South Korea (Remote)", EmploymentType.FullTime, 3);
            j8.Publish(); j8.ReplaceSkills(new[] { skillSelenium.Id, skillJava.Id, skillDocker.Id }); jobs.Add(j8);

            var j9 = JobPosting.Create(defaultOrg.Id, recruiterUser.Id, "Backend Java Developer",
                "Develop microservice backends using Java Spring Boot with PostgreSQL, Redis, and Kafka. Design event-driven architectures and implement domain-driven design patterns.",
                "Bangalore, India (Hybrid)", EmploymentType.FullTime, 3);
            j9.Publish(); j9.ReplaceSkills(new[] { skillJava.Id, skillPostgres.Id, skillRedis.Id }); jobs.Add(j9);

            var j10 = JobPosting.Create(defaultOrg.Id, recruiterUser.Id, "Machine Learning Engineer",
                "Build and deploy production ML models for NLP, recommendation systems, and predictive analytics. Design feature engineering pipelines and model monitoring infrastructure.",
                "Remote (Global)", EmploymentType.FullTime, 4);
            j10.Publish(); j10.ReplaceSkills(new[] { skillML.Id, skillPython.Id, skillAws.Id }); jobs.Add(j10);

            var j11 = JobPosting.Create(defaultOrg.Id, lisaRecruiter.Id, "Site Reliability Engineer (SRE)",
                "Ensure high availability and reliability of production systems. Design observability stacks, implement chaos engineering practices, and manage incident response processes.",
                "Melbourne, Australia (Remote)", EmploymentType.Contract, 5);
            j11.Publish(); j11.ReplaceSkills(new[] { skillK8s.Id, skillGo.Id, skillAws.Id, skillDocker.Id }); jobs.Add(j11);

            var j12 = JobPosting.Create(defaultOrg.Id, lisaRecruiter.Id, "Part-Time Technical Writer",
                "Create comprehensive API documentation, developer guides, and technical blog posts. Collaborate with engineering teams to produce clear, accurate, and engaging technical content.",
                "Remote (Global)", EmploymentType.PartTime, 1);
            j12.Publish(); jobs.Add(j12);

            await recruitmentDb.JobPostings.AddRangeAsync(jobs);
            await recruitmentDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} job postings", jobs.Count);
        }

        // Query back all jobs
        var allJobs = await recruitmentDb.JobPostings.Where(j => j.Status == JobPostingStatus.Published).ToListAsync();
        var reactJob = allJobs.First(j => j.Title.Contains("React & Frontend"));
        var dotnetJob = allJobs.First(j => j.Title.Contains(".NET"));
        var aiJob = allJobs.First(j => j.Title.Contains("AI"));
        var devopsJob = allJobs.First(j => j.Title.Contains("DevOps"));
        var uxJob = allJobs.First(j => j.Title.Contains("UI/UX"));
        var dataJob = allJobs.First(j => j.Title.Contains("Data Engineer"));
        var mobileJob = allJobs.First(j => j.Title.Contains("Mobile"));
        var qaJob = allJobs.First(j => j.Title.Contains("QA"));
        var javaJob = allJobs.First(j => j.Title.Contains("Java"));
        var mlJob = allJobs.First(j => j.Title.Contains("Machine Learning"));
        var sreJob = allJobs.First(j => j.Title.Contains("SRE"));
        var writerJob = allJobs.First(j => j.Title.Contains("Technical Writer"));

        // ════════════════════════════════════════════════════════════════
        // 13. APPLICATIONS (20 applications across all pipeline stages)
        // ════════════════════════════════════════════════════════════════
        if (!await recruitmentDb.Applications.AnyAsync())
        {
            // --- HIRED (2) ---
            var app1 = Application.Submit(reactJob.Id, profileKavinda.Id);
            app1.SetAiMatchScore(96.5m);
            app1.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Exceptional React and TypeScript skills verified");
            app1.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Top candidate — AI match score 96.5%");
            app1.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "Technical interview scheduled with Engineering Manager");
            app1.AdvanceTo(ApplicationStage.Interviewed, managerUser.Id, "Outstanding technical interview — strong system design answers");
            app1.AdvanceTo(ApplicationStage.Offered, recruiterUser.Id, "Offer extended: Senior React Architect position");
            app1.AdvanceTo(ApplicationStage.Hired, recruiterUser.Id, "Offer accepted — start date confirmed");

            var app20 = Application.Submit(mlJob.Id, profileSarah.Id);
            app20.SetAiMatchScore(94.0m);
            app20.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Strong ML and Python credentials");
            app20.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Published researcher with production ML experience");
            app20.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "ML deep-dive interview scheduled");
            app20.AdvanceTo(ApplicationStage.Interviewed, managerUser.Id, "Impressive model design and deployment knowledge");
            app20.AdvanceTo(ApplicationStage.Offered, recruiterUser.Id, "Competitive offer extended");
            app20.AdvanceTo(ApplicationStage.Hired, recruiterUser.Id, "Offer accepted");

            // --- OFFERED (2) ---
            var app2 = Application.Submit(dotnetJob.Id, profileJohn.Id);
            app2.SetAiMatchScore(88.0m);
            app2.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Strong C# and backend experience verified");
            app2.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Shortlisted for Hiring Manager review");
            app2.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "System design interview scheduled");
            app2.AdvanceTo(ApplicationStage.Interviewed, managerUser.Id, "Excellent API design skills demonstrated");
            app2.AdvanceTo(ApplicationStage.Offered, recruiterUser.Id, "Offer letter sent for Full Stack .NET Engineer");

            var app19 = Application.Submit(javaJob.Id, profileJohn.Id);
            app19.SetAiMatchScore(85.5m);
            app19.AdvanceTo(ApplicationStage.Screening, lisaRecruiter.Id, "Java Spring Boot expertise confirmed");
            app19.AdvanceTo(ApplicationStage.Shortlisted, lisaRecruiter.Id, "Strong microservice architecture background");
            app19.AdvanceTo(ApplicationStage.InterviewScheduled, lisaRecruiter.Id, "Technical coding round scheduled");
            app19.AdvanceTo(ApplicationStage.Interviewed, managerUser.Id, "Clean code with excellent problem-solving");
            app19.AdvanceTo(ApplicationStage.Offered, lisaRecruiter.Id, "Offer extended for Backend Java Developer");

            // --- INTERVIEWED (3) ---
            var app5 = Application.Submit(aiJob.Id, profileSarah.Id);
            app5.SetAiMatchScore(82.0m);
            app5.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "AI/ML background validated");
            app5.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Strong Python and ML skills");
            app5.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "Gemini API integration interview scheduled");
            app5.AdvanceTo(ApplicationStage.Interviewed, managerUser.Id, "Good understanding of LLM integration patterns");

            var app16 = Application.Submit(uxJob.Id, profileJane.Id);
            app16.SetAiMatchScore(91.0m);
            app16.AdvanceTo(ApplicationStage.Screening, lisaRecruiter.Id, "Outstanding design portfolio reviewed");
            app16.AdvanceTo(ApplicationStage.Shortlisted, lisaRecruiter.Id, "Top UX candidate with design system experience");
            app16.AdvanceTo(ApplicationStage.InterviewScheduled, lisaRecruiter.Id, "Design challenge scheduled");
            app16.AdvanceTo(ApplicationStage.Interviewed, managerUser.Id, "Exceptional design thinking and accessibility knowledge");

            var app18 = Application.Submit(qaJob.Id, profilePriya.Id);
            app18.SetAiMatchScore(72.0m);
            app18.AdvanceTo(ApplicationStage.Screening, lisaRecruiter.Id, "Java testing skills being evaluated");
            app18.AdvanceTo(ApplicationStage.Shortlisted, lisaRecruiter.Id, "Meets minimum requirements for QA role");
            app18.AdvanceTo(ApplicationStage.InterviewScheduled, lisaRecruiter.Id, "Automation framework design interview");
            app18.AdvanceTo(ApplicationStage.Interviewed, managerUser.Id, "Adequate technical skills, needs mentorship");

            // --- INTERVIEW SCHEDULED (3) ---
            var app3 = Application.Submit(reactJob.Id, profileJane.Id);
            app3.SetAiMatchScore(90.5m);
            app3.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Excellent frontend portfolio reviewed");
            app3.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Strong React expertise with design system background");
            app3.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "Technical interview scheduled for next week");

            var app6 = Application.Submit(devopsJob.Id, profileDavid.Id);
            app6.SetAiMatchScore(93.0m);
            app6.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Kubernetes and Docker expertise verified");
            app6.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Cloud certifications confirmed");
            app6.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "Infrastructure design interview scheduled");

            var app13 = Application.Submit(dataJob.Id, profileSarah.Id);
            app13.SetAiMatchScore(86.0m);
            app13.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Data engineering skills assessed");
            app13.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Strong SQL and Python background");
            app13.AdvanceTo(ApplicationStage.InterviewScheduled, recruiterUser.Id, "Pipeline architecture interview scheduled");

            // --- SHORTLISTED (3) ---
            var app4 = Application.Submit(dotnetJob.Id, profileAlex.Id);
            app4.SetAiMatchScore(84.5m);
            app4.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "C# and EF Core skills validated");
            app4.AdvanceTo(ApplicationStage.Shortlisted, recruiterUser.Id, "Promising junior candidate for .NET team");

            var app11 = Application.Submit(uxJob.Id, profileTom.Id);
            app11.SetAiMatchScore(89.0m);
            app11.AdvanceTo(ApplicationStage.Screening, lisaRecruiter.Id, "Figma expertise and design awards noted");
            app11.AdvanceTo(ApplicationStage.Shortlisted, lisaRecruiter.Id, "Excellent portfolio — scheduling interview soon");

            var app14 = Application.Submit(sreJob.Id, profileDavid.Id);
            app14.SetAiMatchScore(91.5m);
            app14.AdvanceTo(ApplicationStage.Screening, lisaRecruiter.Id, "SRE experience and AWS certs verified");
            app14.AdvanceTo(ApplicationStage.Shortlisted, lisaRecruiter.Id, "Top SRE candidate");

            // --- SCREENING (3) ---
            var app7 = Application.Submit(devopsJob.Id, profileMichael.Id);
            app7.SetAiMatchScore(95.0m);
            app7.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Principal-level candidate under review");

            var app12 = Application.Submit(aiJob.Id, profileJohn.Id);
            app12.SetAiMatchScore(92.0m);
            app12.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Gemini API integration experience being evaluated");

            var app15 = Application.Submit(mobileJob.Id, profileEmma.Id);
            app15.SetAiMatchScore(87.5m);
            app15.AdvanceTo(ApplicationStage.Screening, lisaRecruiter.Id, "React Native portfolio under review");

            // --- APPLIED (3) ---
            var app8 = Application.Submit(reactJob.Id, profileEmma.Id);
            app8.SetAiMatchScore(71.0m);

            var app9 = Application.Submit(qaJob.Id, profileJames.Id);
            app9.SetAiMatchScore(94.5m);

            var app10 = Application.Submit(dotnetJob.Id, profilePriya.Id);
            app10.SetAiMatchScore(78.0m);

            // --- REJECTED (2) ---
            var app17 = Application.Submit(dataJob.Id, profileMichael.Id);
            app17.SetAiMatchScore(55.0m);
            app17.AdvanceTo(ApplicationStage.Screening, recruiterUser.Id, "Reviewing data engineering skills");
            app17.AdvanceTo(ApplicationStage.Rejected, recruiterUser.Id, "Skills primarily in infrastructure — not aligned with data engineering role requirements");

            var appRej2 = Application.Submit(javaJob.Id, profilePriya.Id);
            appRej2.SetAiMatchScore(62.0m);
            appRej2.AdvanceTo(ApplicationStage.Screening, lisaRecruiter.Id, "Java experience being evaluated");
            appRej2.AdvanceTo(ApplicationStage.Shortlisted, lisaRecruiter.Id, "Under consideration");
            appRej2.AdvanceTo(ApplicationStage.Rejected, lisaRecruiter.Id, "Insufficient experience for senior Java role — recommended for junior position");

            var allApps = new[] { app1, app2, app3, app4, app5, app6, app7, app8, app9, app10, app11, app12, app13, app14, app15, app16, app17, app18, app19, app20, appRej2 };
            await recruitmentDb.Applications.AddRangeAsync(allApps);
            await recruitmentDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} applications across all pipeline stages", allApps.Length);

            // ════════════════════════════════════════════════════════════════
            // 14. APPLICATION ANALYSES
            // ════════════════════════════════════════════════════════════════
            if (!await recruitmentDb.ApplicationAnalyses.AnyAsync())
            {
                var analyses = new List<ApplicationAnalysis>
                {
                    ApplicationAnalysis.Create(app1.Id, 96.5m, new[] { skillReact.Id, skillTs.Id, skillCSharp.Id, skillDotNet.Id, skillTailwind.Id },
                        new[] { skillGraphQL.Id }, "Exceptional match. Candidate has Expert-level React and TypeScript skills with 5+ years of full-stack experience. Minor gap in GraphQL but compensated by strong overall profile."),
                    ApplicationAnalysis.Create(app2.Id, 88.0m, new[] { skillCSharp.Id, skillDotNet.Id, skillPython.Id },
                        new[] { skillEfCore.Id }, "Strong backend match. Extensive C# experience and AI background adds value. EF Core proficiency could be developed on the job."),
                    ApplicationAnalysis.Create(app3.Id, 90.5m, new[] { skillReact.Id, skillTs.Id, skillTailwind.Id, skillFigma.Id },
                        new[] { skillCSharp.Id }, "Excellent frontend specialist. Design system experience is a strong differentiator. Backend skills limited but not required for this role."),
                    ApplicationAnalysis.Create(app4.Id, 84.5m, new[] { skillCSharp.Id, skillDotNet.Id, skillEfCore.Id, skillDocker.Id },
                        new[] { skillSql.Id }, "Good match for mid-level .NET position. Docker containerization skills are a plus. SQL Server experience needs development."),
                    ApplicationAnalysis.Create(app5.Id, 82.0m, new[] { skillPython.Id, skillML.Id, skillSql.Id },
                        new[] { skillGemini.Id }, "Strong ML foundation. Data science background applicable to AI role. Gemini API specific experience lacking but transferable skills present."),
                    ApplicationAnalysis.Create(app6.Id, 93.0m, new[] { skillDocker.Id, skillK8s.Id, skillAws.Id, skillGo.Id, skillPython.Id },
                        Array.Empty<Guid>(), "Near-perfect match. 7+ years DevOps experience with all required technologies. Multi-certification validates expertise."),
                    ApplicationAnalysis.Create(app7.Id, 95.0m, new[] { skillAws.Id, skillK8s.Id, skillDocker.Id, skillSysDesign.Id },
                        Array.Empty<Guid>(), "Principal-level candidate exceeds all requirements. May be overqualified for the role but brings exceptional value."),
                    ApplicationAnalysis.Create(app8.Id, 71.0m, new[] { skillReact.Id, skillTs.Id },
                        new[] { skillCSharp.Id, skillDotNet.Id, skillSql.Id }, "Partial match. Strong mobile/React skills but lacking required backend and database experience for this senior role."),
                    ApplicationAnalysis.Create(app9.Id, 94.5m, new[] { skillSelenium.Id, skillJava.Id, skillPython.Id, skillDocker.Id },
                        Array.Empty<Guid>(), "Excellent match for QA Automation. 6+ years with Selenium and comprehensive test framework experience. ISTQB certified."),
                    ApplicationAnalysis.Create(app10.Id, 78.0m, new[] { skillCSharp.Id, skillDotNet.Id, skillSql.Id },
                        new[] { skillEfCore.Id, skillDocker.Id }, "Decent match for junior .NET role. Java background shows adaptability. Needs EF Core and Docker ramp-up."),
                    ApplicationAnalysis.Create(app11.Id, 89.0m, new[] { skillFigma.Id, skillTailwind.Id },
                        new[] { skillReact.Id }, "Strong design match. Award-winning designer with enterprise design system experience. Limited frontend coding skills acceptable for design role."),
                    ApplicationAnalysis.Create(app12.Id, 92.0m, new[] { skillPython.Id, skillGemini.Id, skillML.Id },
                        Array.Empty<Guid>(), "Excellent AI specialist. Hands-on Gemini API experience with production ML pipeline knowledge. Strong backend complements AI role."),
                    ApplicationAnalysis.Create(app13.Id, 86.0m, new[] { skillPython.Id, skillSql.Id, skillAws.Id },
                        new[] { skillPostgres.Id }, "Good data engineering fit. Strong analytics background with Python and SQL. PostgreSQL-specific experience needed."),
                    ApplicationAnalysis.Create(app14.Id, 91.5m, new[] { skillK8s.Id, skillDocker.Id, skillAws.Id, skillGo.Id },
                        Array.Empty<Guid>(), "Top SRE candidate. Production experience with observability stacks and incident response. All core skills present."),
                    ApplicationAnalysis.Create(app15.Id, 87.5m, new[] { skillRN.Id, skillTs.Id, skillReact.Id },
                        new[] { skillNode.Id }, "Strong mobile developer. 500K+ app downloads demonstrate production experience. Node.js backend skills needed for API work."),
                    ApplicationAnalysis.Create(app16.Id, 91.0m, new[] { skillFigma.Id, skillReact.Id, skillTailwind.Id },
                        Array.Empty<Guid>(), "Outstanding UX candidate. Rare combination of design expertise and frontend implementation skills. Accessibility focus is highly valuable."),
                    ApplicationAnalysis.Create(app17.Id, 55.0m, new[] { skillAws.Id, skillDocker.Id },
                        new[] { skillPython.Id, skillSql.Id, skillPostgres.Id }, "Poor match. Candidate's cloud architecture skills don't align with data engineering role requirements. Recommended for DevOps roles instead."),
                    ApplicationAnalysis.Create(app18.Id, 72.0m, new[] { skillJava.Id, skillSql.Id },
                        new[] { skillSelenium.Id, skillDocker.Id }, "Partial match. Backend Java skills applicable but lacks dedicated QA automation framework experience. Could grow into role with mentorship."),
                    ApplicationAnalysis.Create(app19.Id, 85.5m, new[] { skillJava.Id, skillPython.Id, skillPostgres.Id },
                        new[] { skillRedis.Id }, "Good match. Versatile backend engineer with Java and microservice experience. Redis caching experience needed but learnable."),
                    ApplicationAnalysis.Create(app20.Id, 94.0m, new[] { skillML.Id, skillPython.Id, skillAws.Id },
                        Array.Empty<Guid>(), "Excellent match. Published researcher with production ML deployment experience. Kaggle Master rank validates practical skills."),
                    ApplicationAnalysis.Create(appRej2.Id, 62.0m, new[] { skillJava.Id },
                        new[] { skillPostgres.Id, skillRedis.Id }, "Below threshold. Junior-level Java experience insufficient for senior role. Recommended for more junior positions."),
                };
                await recruitmentDb.ApplicationAnalyses.AddRangeAsync(analyses);
                await recruitmentDb.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} application analyses", analyses.Count);
            }

            // ════════════════════════════════════════════════════════════════
            // 15. MESSAGES (recruiter ↔ candidate conversations)
            // ════════════════════════════════════════════════════════════════
            if (!await recruitmentDb.Messages.AnyAsync())
            {
                var msgs = new List<Message>
                {
                    Message.Create(app1.Id, recruiterUser.Id, "Hi Kavinda! We've reviewed your profile and we're very impressed with your React and .NET experience. We'd love to schedule a technical interview with you. Would next Tuesday work?"),
                    Message.Create(app1.Id, candidateUser.Id, "Thank you! I'm excited about this opportunity. Tuesday works perfectly for me. What time should I be available?"),
                    Message.Create(app1.Id, recruiterUser.Id, "Great! Let's schedule it for 2:00 PM IST. You'll receive a Google Meet link shortly. The interview will focus on React architecture and system design."),
                    Message.Create(app1.Id, candidateUser.Id, "Perfect, I'll be prepared. Looking forward to it!"),
                    Message.Create(app1.Id, recruiterUser.Id, "Congratulations Kavinda! The team was very impressed with your interview performance. We'd like to extend an offer for the Senior React Architect position. Please check your email for the detailed offer letter."),

                    Message.Create(app2.Id, recruiterUser.Id, "Hi John, we've shortlisted your application for the Full Stack .NET Engineer position. Your AI/backend expertise is exactly what we're looking for. Let's schedule a system design interview."),
                    Message.Create(app2.Id, johnUser.Id, "That sounds great! I'm particularly interested in how you're integrating AI into the recruitment pipeline. I'm available any day next week."),
                    Message.Create(app2.Id, recruiterUser.Id, "Excellent! We've scheduled your interview for Wednesday at 10 AM PST. You'll discuss system design with our Engineering Manager."),

                    Message.Create(app3.Id, recruiterUser.Id, "Hi Jane, your design system portfolio is exceptional! We'd like to discuss the Senior React & Frontend Architect role with you. Are you available for a technical discussion?"),
                    Message.Create(app3.Id, janeUser.Id, "Thank you so much! I've been following TalentIQ's product and love the design direction. I'm available next week for a conversation."),

                    Message.Create(app5.Id, recruiterUser.Id, "Hi Sarah, we've reviewed your ML research background and production experience. We'd like to explore how your skills align with our AI integration needs. Can we set up a call?"),
                    Message.Create(app5.Id, sarahUser.Id, "Absolutely! I'm particularly interested in the Gemini API integration work. My experience with NLP and recommendation systems would be very relevant here."),

                    Message.Create(app6.Id, recruiterUser.Id, "David, your DevOps background is impressive — especially the Kubernetes and observability work. We're scheduling infrastructure design interviews. Would Thursday work?"),
                    Message.Create(app6.Id, davidUser.Id, "Thursday works perfectly. I'm excited to discuss your cloud infrastructure challenges. I've been working with similar multi-region setups."),

                    Message.Create(app9.Id, lisaRecruiter.Id, "Hi James, your application for QA Automation Engineer has been received. Your Selenium framework experience and ISTQB certification caught our attention. We'll begin the review process shortly."),

                    Message.Create(app11.Id, lisaRecruiter.Id, "Tom, your portfolio is stunning! The German Design Award-winning work really stands out. We're very interested in discussing the UI/UX Designer role with you."),
                    Message.Create(app11.Id, tomUser.Id, "Thank you Lisa! I've been looking at TalentIQ's platform and have some ideas for improving the candidate experience. Would love to share them during an interview."),

                    Message.Create(app16.Id, lisaRecruiter.Id, "Jane, we're thrilled about your interview performance. Your accessibility expertise and design system knowledge are exactly what our product team needs. Expect to hear from us soon with next steps!"),

                    Message.Create(app20.Id, recruiterUser.Id, "Sarah, congratulations! Your ML Engineer interview was outstanding. The team was particularly impressed with your production deployment experience. We're preparing a formal offer."),
                    Message.Create(app20.Id, sarahUser.Id, "Thank you! I had a wonderful experience during the interview process. I'm very excited about the ML challenges at TalentIQ."),
                };
                await recruitmentDb.Messages.AddRangeAsync(msgs);
                await recruitmentDb.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} messages", msgs.Count);
            }
        }

        // Query back applications for interview & AI seeding
        var appsList = await recruitmentDb.Applications.ToListAsync();

        // ════════════════════════════════════════════════════════════════
        // 16. INTERVIEWS (10 interviews across all statuses)
        // ════════════════════════════════════════════════════════════════
        if (!await interviewDb.Interviews.AnyAsync() && appsList.Any())
        {
            var interviewScheduledApps = appsList.Where(a => a.Stage >= ApplicationStage.InterviewScheduled).ToList();
            var interviews = new List<Interview.Domain.Entities.Interview>();

            // Completed interviews (for hired/offered/interviewed apps)
            var completedAppIds = appsList.Where(a => a.Stage >= ApplicationStage.Interviewed).Select(a => a.Id).ToList();
            for (int i = 0; i < completedAppIds.Count && i < 7; i++)
            {
                interviews.Add(new Interview.Domain.Entities.Interview
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = completedAppIds[i],
                    InterviewerUserId = managerUser.Id,
                    ScheduledStartTime = DateTime.UtcNow.AddDays(-10 + i),
                    MeetingLink = $"https://meet.google.com/tiq-demo-{i + 1:D3}",
                    Status = InterviewStatus.Completed
                });
            }

            // Scheduled interviews (for interviewScheduled apps)
            var scheduledAppIds = appsList.Where(a => a.Stage == ApplicationStage.InterviewScheduled).Select(a => a.Id).ToList();
            for (int i = 0; i < scheduledAppIds.Count; i++)
            {
                interviews.Add(new Interview.Domain.Entities.Interview
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = scheduledAppIds[i],
                    InterviewerUserId = managerUser.Id,
                    ScheduledStartTime = DateTime.UtcNow.AddDays(2 + i).AddHours(10 + i),
                    MeetingLink = $"https://meet.google.com/tiq-sched-{i + 1:D3}",
                    Status = InterviewStatus.Scheduled
                });
            }

            // One cancelled interview
            if (interviewScheduledApps.Any())
            {
                interviews.Add(new Interview.Domain.Entities.Interview
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = interviewScheduledApps.Last().Id,
                    InterviewerUserId = managerUser.Id,
                    ScheduledStartTime = DateTime.UtcNow.AddDays(-3),
                    MeetingLink = "https://meet.google.com/tiq-cancelled-001",
                    Status = InterviewStatus.Cancelled
                });
            }

            await interviewDb.Interviews.AddRangeAsync(interviews);
            await interviewDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} interviews", interviews.Count);

            // ════════════════════════════════════════════════════════════════
            // 17. CANDIDATE EVALUATIONS (for completed interviews)
            // ════════════════════════════════════════════════════════════════
            var completedInterviews = await interviewDb.Interviews.Where(i => i.Status == InterviewStatus.Completed).ToListAsync();
            if (!await interviewDb.CandidateEvaluations.AnyAsync() && completedInterviews.Any())
            {
                var evaluationData = new (decimal Tech, decimal Behav, string Rec)[]
                {
                    (9.5m, 9.0m, "StrongHire"), (8.5m, 8.0m, "Hire"), (9.0m, 8.5m, "StrongHire"),
                    (7.5m, 8.0m, "Hire"), (8.0m, 7.0m, "Hire"), (6.5m, 7.0m, "NoHire"), (9.0m, 9.5m, "StrongHire"),
                };
                var evals = new List<CandidateEvaluation>();
                for (int i = 0; i < completedInterviews.Count && i < evaluationData.Length; i++)
                {
                    var (tech, behav, rec) = evaluationData[i];
                    evals.Add(new CandidateEvaluation
                    {
                        Id = Guid.NewGuid(),
                        InterviewId = completedInterviews[i].Id,
                        TechnicalScore = tech,
                        BehavioralScore = behav,
                        Recommendation = rec
                    });
                }
                await interviewDb.CandidateEvaluations.AddRangeAsync(evals);
                await interviewDb.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} candidate evaluations", evals.Count);
            }
        }

        // ════════════════════════════════════════════════════════════════
        // 18. AI MODULE — Resume Analyses, Question Sets, Execution Logs
        // ════════════════════════════════════════════════════════════════
        if (!await aiDb.ResumeAnalyses.AnyAsync() && appsList.Any())
        {
            var resumeData = new (decimal Score, string[] Matched, string[] Missing, string Summary)[]
            {
                (96.5m, new[] { "React", "TypeScript", "C#", "ASP.NET Core", "TailwindCSS" }, new[] { "GraphQL" },
                    "Exceptional match. Candidate demonstrates Expert-level proficiency in React and TypeScript with 5+ years of production experience building scalable web APIs."),
                (88.0m, new[] { "C#", "ASP.NET Core", "Python", "SQL Server" }, new[] { "EF Core" },
                    "Strong backend developer with AI integration experience. C# and Python proficiency at Expert level. Minor gap in EF Core."),
                (90.5m, new[] { "React", "TypeScript", "TailwindCSS", "Figma" }, new[] { "C#" },
                    "Outstanding frontend specialist. Design system expertise is a major differentiator. Strong accessibility focus."),
                (93.0m, new[] { "Docker", "Kubernetes", "AWS", "Go", "Python" }, Array.Empty<string>(),
                    "Near-perfect DevOps match. 7+ years experience with all required technologies and multiple cloud certifications."),
                (94.5m, new[] { "Selenium", "Java", "Python", "Docker" }, Array.Empty<string>(),
                    "Excellent QA automation match. Comprehensive framework experience with ISTQB certification and CI/CD integration skills."),
                (94.0m, new[] { "Machine Learning", "Python", "AWS" }, Array.Empty<string>(),
                    "Top-tier ML Engineer candidate. Published researcher with Kaggle Master rank and production deployment experience."),
                (55.0m, new[] { "AWS", "Docker" }, new[] { "Python", "SQL Server", "PostgreSQL" },
                    "Poor match for data engineering. Cloud infrastructure skills don't align with ETL pipeline and analytics requirements."),
                (82.0m, new[] { "Python", "Machine Learning", "SQL Server" }, new[] { "Gemini API" },
                    "Good AI skills with strong research background. Gemini-specific experience lacking but ML fundamentals are solid."),
            };
            var analyses = new List<ResumeAnalysis>();
            for (int i = 0; i < resumeData.Length && i < appsList.Count; i++)
            {
                var (score, matched, missing, summary) = resumeData[i];
                analyses.Add(new ResumeAnalysis
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appsList[i].Id,
                    OverallMatchScore = score,
                    MatchedSkillsJson = JsonSerializer.Serialize(matched),
                    MissingSkillsJson = JsonSerializer.Serialize(missing),
                    Summary = summary,
                    IsFallbackExecution = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-i)
                });
            }
            await aiDb.ResumeAnalyses.AddRangeAsync(analyses);
            await aiDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} resume analyses", analyses.Count);
        }

        if (!await aiDb.InterviewQuestionSets.AnyAsync() && appsList.Any())
        {
            var questionSets = new List<InterviewQuestionSet>();
            var questionData = new[]
            {
                new
                {
                    Questions = new[]
                    {
                        new { Type = "Technical", Question = "Explain how you would architect a React application with 50+ pages and shared state management. What patterns would you use?", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "How would you implement a real-time collaborative editing feature using WebSockets and React?", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "Describe your approach to implementing a design token system that supports multiple themes and brands.", Difficulty = "Medium" },
                        new { Type = "Behavioral", Question = "Tell me about a time when you had to refactor a large codebase while maintaining feature development velocity.", Difficulty = "Medium" },
                        new { Type = "Situational", Question = "A critical production bug is discovered in a feature you built. The fix requires changes to a shared component used by 5 teams. How do you approach this?", Difficulty = "Hard" },
                    }
                },
                new
                {
                    Questions = new[]
                    {
                        new { Type = "Technical", Question = "Design a scalable REST API for a job matching system that handles 100K+ concurrent users. Walk through your architecture decisions.", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "How would you implement CQRS and Event Sourcing in an ASP.NET Core application? When would you choose this pattern?", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "Explain the differences between optimistic and pessimistic concurrency in EF Core. When would you use each?", Difficulty = "Medium" },
                        new { Type = "Behavioral", Question = "Describe a situation where you had to make a significant architectural decision with incomplete information.", Difficulty = "Medium" },
                        new { Type = "Situational", Question = "You discover that the database schema design chosen by a colleague will cause performance issues at scale. How do you handle this?", Difficulty = "Medium" },
                    }
                },
                new
                {
                    Questions = new[]
                    {
                        new { Type = "Technical", Question = "How would you design a resume analysis pipeline using Gemini API that handles multi-format documents and produces explainable match scores?", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "Explain your approach to implementing RAG (Retrieval-Augmented Generation) for job description matching.", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "How would you evaluate and mitigate bias in an AI-powered candidate screening system?", Difficulty = "Hard" },
                        new { Type = "Behavioral", Question = "Tell me about a time when an ML model you built didn't perform as expected in production. How did you diagnose and fix it?", Difficulty = "Medium" },
                        new { Type = "Situational", Question = "The AI matching system is producing scores that recruiters disagree with. How would you investigate and resolve this?", Difficulty = "Hard" },
                    }
                },
                new
                {
                    Questions = new[]
                    {
                        new { Type = "Technical", Question = "Design a Kubernetes deployment strategy for a multi-region application with zero-downtime requirements.", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "How would you implement a comprehensive observability stack for 50+ microservices?", Difficulty = "Hard" },
                        new { Type = "Behavioral", Question = "Describe a major production incident you handled. What was your approach to diagnosis and resolution?", Difficulty = "Medium" },
                        new { Type = "Situational", Question = "Your team needs to migrate from a monolithic CI/CD pipeline to a microservices-based approach. How do you plan this?", Difficulty = "Medium" },
                    }
                },
                new
                {
                    Questions = new[]
                    {
                        new { Type = "Technical", Question = "How would you build a cross-platform mobile app that works offline and syncs data when connectivity is restored?", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "Describe your approach to optimizing React Native app performance, especially list rendering and animations.", Difficulty = "Medium" },
                        new { Type = "Behavioral", Question = "Tell me about a time you had to balance user experience with technical constraints on mobile.", Difficulty = "Medium" },
                    }
                },
                new
                {
                    Questions = new[]
                    {
                        new { Type = "Technical", Question = "Design a comprehensive test automation framework for a microservices-based application with 20+ services.", Difficulty = "Hard" },
                        new { Type = "Technical", Question = "How would you implement visual regression testing in a CI/CD pipeline?", Difficulty = "Medium" },
                        new { Type = "Technical", Question = "Explain your strategy for testing distributed systems with eventual consistency.", Difficulty = "Hard" },
                        new { Type = "Behavioral", Question = "Tell me about a time when automated tests caught a critical bug that manual testing missed.", Difficulty = "Medium" },
                    }
                },
            };

            for (int i = 0; i < questionData.Length && i < appsList.Count; i++)
            {
                questionSets.Add(new InterviewQuestionSet
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appsList[i].Id,
                    QuestionsJson = JsonSerializer.Serialize(questionData[i].Questions),
                    IsFallbackExecution = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-i)
                });
            }
            await aiDb.InterviewQuestionSets.AddRangeAsync(questionSets);
            await aiDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} interview question sets", questionSets.Count);
        }

        if (!await aiDb.AiExecutionLogs.AnyAsync())
        {
            var logs = new List<AiExecutionLog>
            {
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-2.0-Flash", DurationMs = 420, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-1) },
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-2.0-Flash", DurationMs = 385, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-2) },
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-2.0-Flash", DurationMs = 510, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-3) },
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-1.5-Pro", DurationMs = 1250, IsSuccess = true, IsFallback = true, ExecutedAt = DateTime.UtcNow.AddHours(-4) },
                new() { Id = Guid.NewGuid(), Feature = "InterviewQuestionGen", Provider = "Gemini-2.0-Flash", DurationMs = 380, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-5) },
                new() { Id = Guid.NewGuid(), Feature = "InterviewQuestionGen", Provider = "Gemini-2.0-Flash", DurationMs = 445, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-6) },
                new() { Id = Guid.NewGuid(), Feature = "InterviewQuestionGen", Provider = "Gemini-2.0-Flash", DurationMs = 395, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-7) },
                new() { Id = Guid.NewGuid(), Feature = "CandidateMatch", Provider = "Gemini-2.0-Flash", DurationMs = 290, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-8) },
                new() { Id = Guid.NewGuid(), Feature = "CandidateMatch", Provider = "Gemini-2.0-Flash", DurationMs = 310, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-9) },
                new() { Id = Guid.NewGuid(), Feature = "CandidateMatch", Provider = "Gemini-2.0-Flash", DurationMs = 275, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-10) },
                new() { Id = Guid.NewGuid(), Feature = "SkillExtraction", Provider = "Gemini-2.0-Flash", DurationMs = 180, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-11) },
                new() { Id = Guid.NewGuid(), Feature = "SkillExtraction", Provider = "Gemini-2.0-Flash", DurationMs = 195, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-12) },
                new() { Id = Guid.NewGuid(), Feature = "SkillExtraction", Provider = "Gemini-2.0-Flash", DurationMs = 210, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-13) },
                new() { Id = Guid.NewGuid(), Feature = "SkillExtraction", Provider = "Gemini-2.0-Flash", DurationMs = 165, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddHours(-14) },
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-2.0-Flash", DurationMs = 0, IsSuccess = false, IsFallback = false, ErrorMessage = "Rate limit exceeded. Retrying with fallback provider.", ExecutedAt = DateTime.UtcNow.AddHours(-15) },
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-1.5-Pro", DurationMs = 1380, IsSuccess = true, IsFallback = true, ExecutedAt = DateTime.UtcNow.AddHours(-15).AddSeconds(5) },
                new() { Id = Guid.NewGuid(), Feature = "InterviewQuestionGen", Provider = "Gemini-2.0-Flash", DurationMs = 0, IsSuccess = false, IsFallback = false, ErrorMessage = "Request timeout after 30s.", ExecutedAt = DateTime.UtcNow.AddDays(-1) },
                new() { Id = Guid.NewGuid(), Feature = "CandidateMatch", Provider = "Gemini-2.0-Flash", DurationMs = 330, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddDays(-1).AddHours(-1) },
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-2.0-Flash", DurationMs = 450, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddDays(-2) },
                new() { Id = Guid.NewGuid(), Feature = "ResumeAnalysis", Provider = "Gemini-2.0-Flash", DurationMs = 398, IsSuccess = true, IsFallback = false, ExecutedAt = DateTime.UtcNow.AddDays(-2).AddHours(-3) },
            };
            await aiDb.AiExecutionLogs.AddRangeAsync(logs);
            await aiDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} AI execution logs", logs.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 19. ANALYTICS — 30-Day KPI Snapshots + Talent Pool
        // ════════════════════════════════════════════════════════════════
        if (!await analyticsDb.DailyKpiSnapshots.AnyAsync())
        {
            var snapshots = new List<DailyKpiSnapshot>();
            var rng = new Random(42); // Deterministic seed for consistent data across machines
            for (int i = 29; i >= 0; i--)
            {
                int dayIndex = 29 - i;
                snapshots.Add(new DailyKpiSnapshot
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = defaultOrg.Id,
                    SnapshotDate = DateTime.UtcNow.Date.AddDays(-i),
                    TotalApplications = 15 + dayIndex * 2 + rng.Next(0, 5),
                    ShortlistedCount = 8 + dayIndex + rng.Next(0, 3),
                    InterviewsScheduled = 5 + (dayIndex / 2) + rng.Next(0, 3),
                    OffersAccepted = 2 + (dayIndex / 4) + rng.Next(0, 2),
                    AverageTimeToHireDays = 22.0m - (dayIndex * 0.2m) + (rng.Next(-10, 10) * 0.1m)
                });
            }
            await analyticsDb.DailyKpiSnapshots.AddRangeAsync(snapshots);
            await analyticsDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} daily KPI snapshots", snapshots.Count);
        }

        if (!await analyticsDb.TalentPoolEntries.AnyAsync())
        {
            var poolEntries = new List<TalentPoolEntry>
            {
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileKavinda.Id, AddedByRecruiterId = recruiterUser.Id, ConsentStatus = ConsentStatus.Accepted, SkillTags = "[\"React\", \"TypeScript\", \"C#\", \"ASP.NET Core\"]", ProfileSnapshotJson = "Kavinda Perera - Senior Full Stack Engineer with 5.5 years experience. Expert in React and .NET.", CreatedAt = DateTime.UtcNow.AddDays(-20), ConsentRespondedAt = DateTime.UtcNow.AddDays(-19), ConsentExpiryDate = DateTime.UtcNow.AddMonths(12), IsActive = true },
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileJohn.Id, AddedByRecruiterId = recruiterUser.Id, ConsentStatus = ConsentStatus.Accepted, SkillTags = "[\"Python\", \"Gemini API\", \"C#\", \"Machine Learning\"]", ProfileSnapshotJson = "John Doe - AI & Backend Specialist with 6 years experience. Expert in Gemini API integration.", CreatedAt = DateTime.UtcNow.AddDays(-18), ConsentRespondedAt = DateTime.UtcNow.AddDays(-17), ConsentExpiryDate = DateTime.UtcNow.AddMonths(12), IsActive = true },
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileJane.Id, AddedByRecruiterId = lisaRecruiter.Id, ConsentStatus = ConsentStatus.Accepted, SkillTags = "[\"React\", \"TypeScript\", \"Figma\", \"TailwindCSS\"]", ProfileSnapshotJson = "Jane Smith - Frontend Architect with 4 years experience. Expert in design systems.", CreatedAt = DateTime.UtcNow.AddDays(-15), ConsentRespondedAt = DateTime.UtcNow.AddDays(-14), ConsentExpiryDate = DateTime.UtcNow.AddMonths(12), IsActive = true },
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileMichael.Id, AddedByRecruiterId = recruiterUser.Id, ConsentStatus = ConsentStatus.Accepted, SkillTags = "[\"AWS\", \"Kubernetes\", \"Docker\", \"Go\"]", ProfileSnapshotJson = "Shamika Keshan - Principal Cloud Architect with 8 years experience. Multi-cloud expert.", CreatedAt = DateTime.UtcNow.AddDays(-14), ConsentRespondedAt = DateTime.UtcNow.AddDays(-13), ConsentExpiryDate = DateTime.UtcNow.AddMonths(12), IsActive = true },
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileSarah.Id, AddedByRecruiterId = recruiterUser.Id, ConsentStatus = ConsentStatus.Accepted, SkillTags = "[\"Python\", \"Machine Learning\", \"TensorFlow\"]", ProfileSnapshotJson = "Sarah Kumar - Senior Data Scientist with 5 years experience. Published ML researcher.", CreatedAt = DateTime.UtcNow.AddDays(-12), ConsentRespondedAt = DateTime.UtcNow.AddDays(-11), ConsentExpiryDate = DateTime.UtcNow.AddMonths(12), IsActive = true },
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileDavid.Id, AddedByRecruiterId = lisaRecruiter.Id, ConsentStatus = ConsentStatus.Pending, SkillTags = "[\"Docker\", \"Kubernetes\", \"AWS\", \"Go\"]", ProfileSnapshotJson = "David Wilson - Senior DevOps Engineer with 7 years experience. CI/CD and SRE specialist.", CreatedAt = DateTime.UtcNow.AddDays(-5), IsActive = true },
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileEmma.Id, AddedByRecruiterId = lisaRecruiter.Id, ConsentStatus = ConsentStatus.Pending, SkillTags = "[\"React Native\", \"TypeScript\", \"Mobile\"]", ProfileSnapshotJson = "Emma Taylor - Mobile Developer with 4 years experience. 500K+ app downloads.", CreatedAt = DateTime.UtcNow.AddDays(-3), IsActive = true },
                new() { Id = Guid.NewGuid(), CandidateProfileId = profileJames.Id, AddedByRecruiterId = lisaRecruiter.Id, ConsentStatus = ConsentStatus.Declined, SkillTags = "[\"Selenium\", \"Java\", \"Python\"]", ProfileSnapshotJson = "James Park - Senior QA Engineer with 6 years experience. ISTQB certified.", CreatedAt = DateTime.UtcNow.AddDays(-10), ConsentRespondedAt = DateTime.UtcNow.AddDays(-9), IsActive = false },
            };
            await analyticsDb.TalentPoolEntries.AddRangeAsync(poolEntries);
            await analyticsDb.SaveChangesAsync();

            // Progress reports for accepted entries
            var acceptedEntries = poolEntries.Where(e => e.ConsentStatus == ConsentStatus.Accepted).ToList();
            var progressReports = new List<TalentPoolProgressReport>
            {
                new() { Id = Guid.NewGuid(), TalentPoolEntryId = acceptedEntries[0].Id, SkillsGainedJson = "[\"Added Docker certification\", \"Gained system design experience\", \"Learned GraphQL\"]", ResumeFreshnessStatus = "Updated", CurrentMatchScore = 97.0m, Recommendation = "Ready-to-Approach", GeneratedAt = DateTime.UtcNow.AddDays(-5) },
                new() { Id = Guid.NewGuid(), TalentPoolEntryId = acceptedEntries[1].Id, SkillsGainedJson = "[\"Published new AI research paper\", \"Completed advanced Gemini API training\"]", ResumeFreshnessStatus = "Updated", CurrentMatchScore = 93.0m, Recommendation = "Ready-to-Approach", GeneratedAt = DateTime.UtcNow.AddDays(-4) },
                new() { Id = Guid.NewGuid(), TalentPoolEntryId = acceptedEntries[2].Id, SkillsGainedJson = "[\"Won Awwwards recognition\", \"Built new design system\"]", ResumeFreshnessStatus = "Updated", CurrentMatchScore = 91.5m, Recommendation = "Ready-to-Approach", GeneratedAt = DateTime.UtcNow.AddDays(-3) },
                new() { Id = Guid.NewGuid(), TalentPoolEntryId = acceptedEntries[3].Id, SkillsGainedJson = "[\"Earned CKA certification\", \"Led multi-region migration\"]", ResumeFreshnessStatus = "Current", CurrentMatchScore = 95.0m, Recommendation = "High-Priority", GeneratedAt = DateTime.UtcNow.AddDays(-2) },
                new() { Id = Guid.NewGuid(), TalentPoolEntryId = acceptedEntries[4].Id, SkillsGainedJson = "[\"Achieved Kaggle Master rank\", \"Published ICML paper\"]", ResumeFreshnessStatus = "Updated", CurrentMatchScore = 94.0m, Recommendation = "Ready-to-Approach", GeneratedAt = DateTime.UtcNow.AddDays(-1) },
                new() { Id = Guid.NewGuid(), TalentPoolEntryId = acceptedEntries[0].Id, SkillsGainedJson = "[\"Completed Azure certification\"]", ResumeFreshnessStatus = "Stale", CurrentMatchScore = 92.0m, Recommendation = "Follow-Up-Needed", GeneratedAt = DateTime.UtcNow.AddDays(-15) },
            };
            await analyticsDb.TalentPoolProgressReports.AddRangeAsync(progressReports);
            await analyticsDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} talent pool entries and {ReportCount} progress reports", poolEntries.Count, progressReports.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 20. NOTIFICATIONS (15 across various channels and statuses)
        // ════════════════════════════════════════════════════════════════
        if (!await notificationDb.Notifications.AnyAsync())
        {
            var notifications = new List<Notification.Domain.Entities.Notification>
            {
                new() { Id = Guid.NewGuid(), RecipientId = candidateUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Interview Scheduled - Senior React & Frontend Architect", Body = "Your technical interview has been scheduled for next Tuesday at 2:00 PM IST. Please join using the Google Meet link in your dashboard.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-7) },
                new() { Id = Guid.NewGuid(), RecipientId = candidateUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Congratulations! Offer Extended", Body = "We're excited to inform you that TalentIQ Global has extended an offer for the Senior React Architect position. Please check your email for the detailed offer letter.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-3) },
                new() { Id = Guid.NewGuid(), RecipientId = johnUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Application Update - Full Stack .NET Engineer", Body = "Your application for the Full Stack .NET & C# Engineer position has been shortlisted. A recruiter will contact you soon to schedule an interview.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new() { Id = Guid.NewGuid(), RecipientId = johnUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Interview Scheduled - Full Stack .NET Engineer", Body = "Your system design interview has been scheduled for Wednesday at 10 AM PST with our Engineering Manager.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-8) },
                new() { Id = Guid.NewGuid(), RecipientId = janeUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Application Received - Senior React Architect", Body = "Thank you for applying to the Senior React & Frontend Architect position at TalentIQ Global. We'll review your application and get back to you shortly.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-12) },
                new() { Id = Guid.NewGuid(), RecipientId = sarahUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Congratulations! You've Been Hired", Body = "Welcome to TalentIQ Global! Your offer for the Machine Learning Engineer position has been confirmed. Our HR team will reach out with onboarding details.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-1) },
                new() { Id = Guid.NewGuid(), RecipientId = davidUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Interview Reminder - DevOps Engineer", Body = "This is a reminder that your infrastructure design interview is scheduled for tomorrow at 10 AM AEST.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new() { Id = Guid.NewGuid(), RecipientId = michaelUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Application Status - Data Engineer", Body = "After careful consideration, we've decided to move forward with other candidates for the Data Engineer role. We encourage you to apply for our DevOps positions which better match your skills.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-6) },
                new() { Id = Guid.NewGuid(), RecipientId = tomUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Profile Update Reminder", Body = "It's been a while since you updated your TalentIQ profile. Keep your information current to improve your matching score with relevant opportunities.", Status = Notification.Domain.Entities.NotificationStatus.Pending, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), RecipientId = priyaUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "New Job Match - Backend Java Developer", Body = "A new job posting matches your profile: Backend Java Developer at TalentIQ Global. Your match score is 78%. Apply now to get started!", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-4) },
                new() { Id = Guid.NewGuid(), RecipientId = emmaUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Application Under Review", Body = "Your application for the Mobile App Developer (React Native) position is currently under review by our recruitment team.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new() { Id = Guid.NewGuid(), RecipientId = recruiterUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "New Applications Received", Body = "You have 5 new applications to review for the Senior React & Frontend Architect and Full Stack .NET Engineer positions.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-11) },
                new() { Id = Guid.NewGuid(), RecipientId = lisaRecruiter.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Weekly Recruitment Summary", Body = "This week: 8 new applications, 3 interviews scheduled, 1 offer accepted. View your full dashboard for details.", Status = Notification.Domain.Entities.NotificationStatus.Sent, CreatedAt = DateTime.UtcNow.AddDays(-1) },
                new() { Id = Guid.NewGuid(), RecipientId = jamesUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.SMS, Subject = "Talent Pool Invitation", Body = "TalentIQ Global invites you to join their talent pool. Visit your dashboard to review and respond to this request.", Status = Notification.Domain.Entities.NotificationStatus.Failed, CreatedAt = DateTime.UtcNow.AddDays(-9) },
                new() { Id = Guid.NewGuid(), RecipientId = alexUser.Id, Channel = Notification.Domain.Entities.NotificationChannel.Email, Subject = "Application Shortlisted", Body = "Your application for Full Stack .NET & C# Engineer has been shortlisted! A recruiter will be in touch soon to discuss next steps.", Status = Notification.Domain.Entities.NotificationStatus.Pending, CreatedAt = DateTime.UtcNow },
            };
            await notificationDb.Notifications.AddRangeAsync(notifications);
            await notificationDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} notifications", notifications.Count);
        }

        // ════════════════════════════════════════════════════════════════
        // 21. AUDIT LOGS (20 system activity records)
        // ════════════════════════════════════════════════════════════════
        if (!await identityDb.AuditLogs.AnyAsync())
        {
            var auditLogs = new List<AuditLog>
            {
                new() { Id = Guid.NewGuid(), UserId = adminUser.Id, Action = "User.Login", Timestamp = DateTime.UtcNow.AddDays(-14), IpAddress = "192.168.1.100" },
                new() { Id = Guid.NewGuid(), UserId = adminUser.Id, Action = "Organization.Updated", Timestamp = DateTime.UtcNow.AddDays(-14).AddHours(1), IpAddress = "192.168.1.100" },
                new() { Id = Guid.NewGuid(), UserId = adminUser.Id, Action = "Department.Created", Timestamp = DateTime.UtcNow.AddDays(-14).AddHours(2), IpAddress = "192.168.1.100" },
                new() { Id = Guid.NewGuid(), UserId = recruiterUser.Id, Action = "User.Login", Timestamp = DateTime.UtcNow.AddDays(-12), IpAddress = "10.0.0.50" },
                new() { Id = Guid.NewGuid(), UserId = recruiterUser.Id, Action = "JobPosting.Created", Timestamp = DateTime.UtcNow.AddDays(-12).AddHours(1), IpAddress = "10.0.0.50" },
                new() { Id = Guid.NewGuid(), UserId = recruiterUser.Id, Action = "JobPosting.Published", Timestamp = DateTime.UtcNow.AddDays(-12).AddHours(2), IpAddress = "10.0.0.50" },
                new() { Id = Guid.NewGuid(), UserId = candidateUser.Id, Action = "User.Login", Timestamp = DateTime.UtcNow.AddDays(-10), IpAddress = "203.94.68.12" },
                new() { Id = Guid.NewGuid(), UserId = candidateUser.Id, Action = "Profile.Updated", Timestamp = DateTime.UtcNow.AddDays(-10).AddMinutes(30), IpAddress = "203.94.68.12" },
                new() { Id = Guid.NewGuid(), UserId = candidateUser.Id, Action = "Resume.Uploaded", Timestamp = DateTime.UtcNow.AddDays(-10).AddHours(1), IpAddress = "203.94.68.12" },
                new() { Id = Guid.NewGuid(), UserId = candidateUser.Id, Action = "Application.Submitted", Timestamp = DateTime.UtcNow.AddDays(-9), IpAddress = "203.94.68.12" },
                new() { Id = Guid.NewGuid(), UserId = recruiterUser.Id, Action = "Application.StageChanged", Timestamp = DateTime.UtcNow.AddDays(-8), IpAddress = "10.0.0.50" },
                new() { Id = Guid.NewGuid(), UserId = managerUser.Id, Action = "User.Login", Timestamp = DateTime.UtcNow.AddDays(-7), IpAddress = "10.0.0.51" },
                new() { Id = Guid.NewGuid(), UserId = managerUser.Id, Action = "Interview.Evaluated", Timestamp = DateTime.UtcNow.AddDays(-6), IpAddress = "10.0.0.51" },
                new() { Id = Guid.NewGuid(), UserId = lisaRecruiter.Id, Action = "User.Login", Timestamp = DateTime.UtcNow.AddDays(-5), IpAddress = "10.0.0.52" },
                new() { Id = Guid.NewGuid(), UserId = lisaRecruiter.Id, Action = "TalentPool.CandidateAdded", Timestamp = DateTime.UtcNow.AddDays(-5).AddHours(1), IpAddress = "10.0.0.52" },
                new() { Id = Guid.NewGuid(), UserId = recruiterUser.Id, Action = "Application.OfferSent", Timestamp = DateTime.UtcNow.AddDays(-3), IpAddress = "10.0.0.50" },
                new() { Id = Guid.NewGuid(), UserId = candidateUser.Id, Action = "User.Login", Timestamp = DateTime.UtcNow.AddDays(-2), IpAddress = "203.94.68.12" },
                new() { Id = Guid.NewGuid(), UserId = candidateUser.Id, Action = "Offer.Accepted", Timestamp = DateTime.UtcNow.AddDays(-2).AddHours(3), IpAddress = "203.94.68.12" },
                new() { Id = Guid.NewGuid(), UserId = adminUser.Id, Action = "User.Login", Timestamp = DateTime.UtcNow.AddHours(-6), IpAddress = "192.168.1.100" },
                new() { Id = Guid.NewGuid(), UserId = adminUser.Id, Action = "Analytics.DashboardViewed", Timestamp = DateTime.UtcNow.AddHours(-5), IpAddress = "192.168.1.100" },
            };
            await identityDb.AuditLogs.AddRangeAsync(auditLogs);
            await identityDb.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} audit logs", auditLogs.Count);
        }

        logger.LogInformation("Database seed completed successfully! All modules populated.");
    }
}
