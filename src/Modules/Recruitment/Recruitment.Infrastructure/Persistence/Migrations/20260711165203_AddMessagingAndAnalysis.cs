using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Recruitment.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMessagingAndAnalysis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApplicationAnalyses",
                schema: "recruitment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatchScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    MatchedSkillIdsCsv = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    MissingSkillIdsCsv = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Explanation = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    AnalyzedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationAnalyses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                schema: "recruitment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationAnalyses_ApplicationId",
                schema: "recruitment",
                table: "ApplicationAnalyses",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ApplicationId",
                schema: "recruitment",
                table: "Messages",
                column: "ApplicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationAnalyses",
                schema: "recruitment");

            migrationBuilder.DropTable(
                name: "Messages",
                schema: "recruitment");
        }
    }
}
