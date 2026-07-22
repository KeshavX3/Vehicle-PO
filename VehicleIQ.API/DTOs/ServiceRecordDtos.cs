using System.ComponentModel.DataAnnotations;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.DTOs;

public record ServiceRecordDto(
    int Id,
    int VehicleId,
    DateTime Date,
    ServiceType ServiceType,
    string? Description,
    decimal Cost,
    decimal? OdometerReading,
    string? GarageName,
    DateTime? NextServiceDate,
    decimal? NextServiceOdometer,
    string? Notes
);

public record CreateServiceRecordRequest(
    [Required] int VehicleId,
    [Required] DateTime Date,
    [Required] ServiceType ServiceType,
    string? Description,
    [Range(0.00, 9999999.99)] decimal Cost,
    [Range(0.0, 9999999.9)] decimal? OdometerReading,
    string? GarageName,
    DateTime? NextServiceDate,
    [Range(0.0, 9999999.9)] decimal? NextServiceOdometer,
    string? Notes
);
