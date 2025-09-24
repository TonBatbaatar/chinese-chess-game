using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChineseChess.Api.Migrations
{
    /// <inheritdoc />
    public partial class addResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Result",
                table: "Games",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Result",
                table: "Games");
        }
    }
}
