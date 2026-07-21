using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Analytics.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AlignDailyKpiSnapshotSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AvgTimeToHireDays",
                table: "DailyKpiSnapshots",
                newName: "AverageTimeToHireDays");

            migrationBuilder.AddColumn<decimal>(
                name: "CurrentMatchScore",
                table: "TalentPoolProgressReports",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ResumeFreshnessStatus",
                table: "TalentPoolProgressReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "SnapshotDate",
                table: "DailyKpiSnapshots",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddColumn<int>(
                name: "InterviewsScheduled",
                table: "DailyKpiSnapshots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OffersAccepted",
                table: "DailyKpiSnapshots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ShortlistedCount",
                table: "DailyKpiSnapshots",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentMatchScore",
                table: "TalentPoolProgressReports");

            migrationBuilder.DropColumn(
                name: "ResumeFreshnessStatus",
                table: "TalentPoolProgressReports");

            migrationBuilder.DropColumn(
                name: "InterviewsScheduled",
                table: "DailyKpiSnapshots");

            migrationBuilder.DropColumn(
                name: "OffersAccepted",
                table: "DailyKpiSnapshots");

            migrationBuilder.DropColumn(
                name: "ShortlistedCount",
                table: "DailyKpiSnapshots");

            migrationBuilder.RenameColumn(
                name: "AverageTimeToHireDays",
                table: "DailyKpiSnapshots",
                newName: "AvgTimeToHireDays");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "SnapshotDate",
                table: "DailyKpiSnapshots",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");
        }
    }
}
