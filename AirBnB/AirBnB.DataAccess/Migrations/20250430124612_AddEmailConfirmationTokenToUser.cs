using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirBnB.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailConfirmationTokenToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Booking",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EmailConfirmationToken",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Booking");

            migrationBuilder.DropColumn(
                name: "EmailConfirmationToken",
                table: "AspNetUsers");
        }
    }
}
