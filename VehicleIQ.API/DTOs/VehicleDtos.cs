using System.ComponentModel.DataAnnotations;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.DTOs;

public record VehicleDto(
    int Id,
    int UserId,
    string Make,
    string Model,
    int Year,
    string RegistrationNumber,
    VehicleType VehicleType,
    FuelType FuelType,
    string? Color,
    decimal CurrentOdometer,
    string? PhotoUrl
);

public record CreateVehicleRequest(
    [Required] string Make,
    [Required] string Model,
    [Range(1900, 2100)] int Year,
    [Required] string RegistrationNumber,
    [Required] VehicleType VehicleType,
    [Required] FuelType FuelType,
    string? Color,
    string? PhotoUrl,
    [Range(0, 9999999)] decimal CurrentOdometer
);

public record UpdateVehicleRequest(
    [Required] string Make,
    [Required] string Model,
    [Range(1900, 2100)] int Year,
    [Required] string RegistrationNumber,
    [Required] VehicleType VehicleType,
    [Required] FuelType FuelType,
    string? Color,
    string? PhotoUrl,
    [Range(0, 9999999)] decimal CurrentOdometer
);
