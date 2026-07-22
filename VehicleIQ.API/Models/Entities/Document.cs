using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents an uploaded document (PDF, JPG, PNG).
/// Immutable by design — upload or delete, never edit.
/// FileName is system-generated (GUID prefix) for security; OriginalFileName preserves user's name.
/// No UpdatedAt — documents don't get modified after upload.
/// </summary>
public class Document
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? VehicleId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Vehicle? Vehicle { get; set; }
}
