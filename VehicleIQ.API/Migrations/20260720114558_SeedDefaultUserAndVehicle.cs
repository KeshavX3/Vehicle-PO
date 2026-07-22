using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VehicleIQ.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultUserAndVehicle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarUrl", "CreatedAt", "Email", "FullName", "IsActive", "PasswordHash", "Phone", "UpdatedAt" },
                values: new object[] { 1, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "demo@vehicleiq.com", "Keshav Kumar", true, "$2a$11$8mN7yK.rC.v9t9a6d8R8u.C6kK58E1X5q16v24y25t26t27u28v29", "9876543210", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "Vehicles",
                columns: new[] { "Id", "Color", "CreatedAt", "CurrentOdometer", "FuelType", "Make", "Model", "PhotoUrl", "RegistrationNumber", "UpdatedAt", "UserId", "VehicleType", "Year" },
                values: new object[] { 1, "White", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 25000m, 0, "Honda", "City", null, "MH 12 AB 1234", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 0, 2022 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
