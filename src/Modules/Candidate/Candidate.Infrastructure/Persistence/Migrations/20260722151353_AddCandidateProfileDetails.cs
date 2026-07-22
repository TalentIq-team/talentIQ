using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Candidate.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateProfileDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                schema: "candidate",
                table: "CandidateSkills",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastUsed",
                schema: "candidate",
                table: "CandidateSkills",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "YearsOfExperience",
                schema: "candidate",
                table: "CandidateSkills",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AllowAiAnalysis",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AllowRecruiterSearch",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "BehanceUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverPictureUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CurrentCompany",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentJobTitle",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmploymentTypePreference",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExpectedSalary",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GitHubUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Headline",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MediumUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoticePeriod",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "OpenToOpportunities",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredJobTitles",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredLocations",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredName",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ReceiveEmails",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ReceiveSms",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowEmail",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowPhone",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowResume",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "StackOverflowUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TalentPoolConsent",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TimeZone",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwitterUrl",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "WillingToRelocate",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "WorkMode",
                schema: "candidate",
                table: "CandidateProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CandidateAchievements",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IssuedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AwardDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateAchievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateAchievements_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateCertifications",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Organization = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CredentialId = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CredentialUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateCertifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateCertifications_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateDocuments",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentType = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BlobUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateDocuments_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateEducations",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Institution = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Degree = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FieldOfStudy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    GPA = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateEducations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateEducations_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateExperiences",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Company = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    JobTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EmploymentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CurrentlyWorking = table.Column<bool>(type: "bit", nullable: false),
                    Responsibilities = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Achievements = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    TechnologiesUsed = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateExperiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateExperiences_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateLanguages",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReadingLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WritingLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SpeakingLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateLanguages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateLanguages_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CandidateProjects",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(3000)", maxLength: 3000, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Technologies = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    GitHubUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    LiveDemoUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateProjects_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CandidateAchievements_CandidateProfileId",
                schema: "candidate",
                table: "CandidateAchievements",
                column: "CandidateProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateCertifications_CandidateProfileId",
                schema: "candidate",
                table: "CandidateCertifications",
                column: "CandidateProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateDocuments_CandidateProfileId",
                schema: "candidate",
                table: "CandidateDocuments",
                column: "CandidateProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateEducations_CandidateProfileId",
                schema: "candidate",
                table: "CandidateEducations",
                column: "CandidateProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExperiences_CandidateProfileId",
                schema: "candidate",
                table: "CandidateExperiences",
                column: "CandidateProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateLanguages_CandidateProfileId",
                schema: "candidate",
                table: "CandidateLanguages",
                column: "CandidateProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateProjects_CandidateProfileId",
                schema: "candidate",
                table: "CandidateProjects",
                column: "CandidateProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CandidateAchievements",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidateCertifications",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidateDocuments",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidateEducations",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidateExperiences",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidateLanguages",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidateProjects",
                schema: "candidate");

            migrationBuilder.DropColumn(
                name: "Category",
                schema: "candidate",
                table: "CandidateSkills");

            migrationBuilder.DropColumn(
                name: "LastUsed",
                schema: "candidate",
                table: "CandidateSkills");

            migrationBuilder.DropColumn(
                name: "YearsOfExperience",
                schema: "candidate",
                table: "CandidateSkills");

            migrationBuilder.DropColumn(
                name: "Address",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "AllowAiAnalysis",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "AllowRecruiterSearch",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "BehanceUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "City",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "Country",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "CoverPictureUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "Currency",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "CurrentCompany",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "CurrentJobTitle",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "EmploymentTypePreference",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "ExpectedSalary",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "Gender",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "GitHubUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "Headline",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "MediumUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "Nationality",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "NoticePeriod",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "OpenToOpportunities",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PreferredJobTitles",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PreferredLocations",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PreferredName",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "ReceiveEmails",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "ReceiveSms",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "ShowEmail",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "ShowPhone",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "ShowResume",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "StackOverflowUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "TalentPoolConsent",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "TimeZone",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "TwitterUrl",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "WillingToRelocate",
                schema: "candidate",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "WorkMode",
                schema: "candidate",
                table: "CandidateProfiles");
        }
    }
}
