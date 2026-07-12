using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Candidate.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "candidate");

            migrationBuilder.CreateTable(
                name: "CandidateProfiles",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfessionalSummary = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ResumeBlobUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    YearsOfExperience = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateProfiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                schema: "candidate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CandidateSkills",
                schema: "candidate",
                columns: table => new
                {
                    CandidateProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SkillId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProficiencyLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateSkills", x => new { x.CandidateProfileId, x.SkillId });
                    table.ForeignKey(
                        name: "FK_CandidateSkills_CandidateProfiles_CandidateProfileId",
                        column: x => x.CandidateProfileId,
                        principalSchema: "candidate",
                        principalTable: "CandidateProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CandidateSkills_Skills_SkillId",
                        column: x => x.SkillId,
                        principalSchema: "candidate",
                        principalTable: "Skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CandidateProfiles_UserId",
                schema: "candidate",
                table: "CandidateProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSkills_SkillId",
                schema: "candidate",
                table: "CandidateSkills",
                column: "SkillId");

            migrationBuilder.CreateIndex(
                name: "IX_Skills_Name",
                schema: "candidate",
                table: "Skills",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CandidateSkills",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidateProfiles",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "Skills",
                schema: "candidate");
        }
    }
}
