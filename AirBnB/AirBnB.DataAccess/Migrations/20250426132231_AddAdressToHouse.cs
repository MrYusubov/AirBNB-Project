using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AirBnB.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddAdressToHouse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Adress",
                table: "House",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Adress",
                table: "House");
        }
    }
}
