using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Interview.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEvaluationScoresAndInterviewCancellation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "MeetingLink",
                schema: "interview",
                table: "Interviews",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                schema: "interview",
                table: "Interviews",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                schema: "interview",
                table: "Interviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "TechnicalScore",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "Recommendation",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<decimal>(
                name: "BehavioralScore",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AddColumn<string>(
                name: "Comments",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "OverallScore",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_ApplicationId",
                schema: "interview",
                table: "Interviews",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateEvaluations_InterviewId",
                schema: "interview",
                table: "CandidateEvaluations",
                column: "InterviewId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CandidateEvaluations_Interviews_InterviewId",
                schema: "interview",
                table: "CandidateEvaluations",
                column: "InterviewId",
                principalSchema: "interview",
                principalTable: "Interviews",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CandidateEvaluations_Interviews_InterviewId",
                schema: "interview",
                table: "CandidateEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_Interviews_ApplicationId",
                schema: "interview",
                table: "Interviews");

            migrationBuilder.DropIndex(
                name: "IX_CandidateEvaluations_InterviewId",
                schema: "interview",
                table: "CandidateEvaluations");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                schema: "interview",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                schema: "interview",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "Comments",
                schema: "interview",
                table: "CandidateEvaluations");

            migrationBuilder.DropColumn(
                name: "OverallScore",
                schema: "interview",
                table: "CandidateEvaluations");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                schema: "interview",
                table: "CandidateEvaluations");

            migrationBuilder.AlterColumn<string>(
                name: "MeetingLink",
                schema: "interview",
                table: "Interviews",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);

            migrationBuilder.AlterColumn<decimal>(
                name: "TechnicalScore",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Recommendation",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<decimal>(
                name: "BehavioralScore",
                schema: "interview",
                table: "CandidateEvaluations",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldPrecision: 5,
                oldScale: 2);
        }
    }
}
