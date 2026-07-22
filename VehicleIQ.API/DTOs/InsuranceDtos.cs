using System.ComponentModel.DataAnnotations;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.DTOs;

public record InsuranceDto(
    int Id,
    int VehicleId,
    string Provider,
    string PolicyNumber,
    InsuranceCoverageType CoverageType,
    DateTime StartDate,
    DateTime EndDate,
    decimal PremiumAmount,
    string? Notes
);

public record CreateInsuranceRequest(
    [Required] int VehicleId,
    [Required] string Provider,
    [Required] string PolicyNumber,
    [Required] InsuranceCoverageType CoverageType,
    [Required] DateTime StartDate,
    [Required] DateTime EndDate,
    [Range(0.01, 9999999.99)] decimal PremiumAmount,
    string? Notes
);
