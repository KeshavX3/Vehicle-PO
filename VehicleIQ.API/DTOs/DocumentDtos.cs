using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.DTOs;

public record DocumentDto(
    int Id,
    int UserId,
    int? VehicleId,
    DocumentType DocumentType,
    string FileName,
    string OriginalFileName,
    string FilePath,
    string ContentType,
    long FileSizeBytes,
    string? ReferenceType,
    int? ReferenceId,
    DateTime CreatedAt
);
