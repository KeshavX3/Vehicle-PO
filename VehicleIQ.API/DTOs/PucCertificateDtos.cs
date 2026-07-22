using System.ComponentModel.DataAnnotations;

namespace VehicleIQ.API.DTOs;

public record PucCertificateDto(
    int Id,
    int VehicleId,
    DateTime Date,
    DateTime ExpiryDate,
    string? CertificateNumber,
    string? EmissionLevel,
    string? Notes
);

public record CreatePucCertificateRequest(
    [Required] int VehicleId,
    [Required] DateTime Date,
    [Required] DateTime ExpiryDate,
    string? CertificateNumber,
    string? EmissionLevel,
    string? Notes
);
