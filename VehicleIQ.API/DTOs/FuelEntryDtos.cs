using System.ComponentModel.DataAnnotations;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.DTOs;

public record FuelEntryDto(
    int Id,
    int VehicleId,
    DateTime Date,
    FuelType FuelType,
    decimal Quantity,
    decimal PricePerLiter,
    decimal TotalCost,
    decimal OdometerReading,
    bool IsFullTank,
    string? FuelStationName,
    string? Notes,
    decimal? CalculatedMileage
);

public record CreateFuelEntryRequest(
    [Required] int VehicleId,
    [Required] DateTime Date,
    [Required] FuelType FuelType,
    [Range(0.01, 1000.00)] decimal Quantity,
    [Range(0.01, 1000.00)] decimal PricePerLiter,
    [Range(0.0, 9999999.9)] decimal OdometerReading,
    bool IsFullTank,
    string? FuelStationName,
    string? Notes
);
