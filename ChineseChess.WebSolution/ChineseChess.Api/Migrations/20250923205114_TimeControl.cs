using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChineseChess.Api.Migrations
{
    /// <inheritdoc />
    public partial class TimeControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "Increment",
                table: "Games",
                type: "TEXT",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "Initial",
                table: "Games",
                type: "TEXT",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Increment",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Initial",
                table: "Games");
        }
    }
}
