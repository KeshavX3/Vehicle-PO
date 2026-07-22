namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents a PUC (Pollution Under Control) certificate.
/// ExpiryDate feeds into the Reminder system for renewal notifications.
/// </summary>
public class PucCertificate : BaseEntity
{
    public int VehicleId { get; set; }
    public DateTime Date { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string? CertificateNumber { get; set; }
    public string? EmissionLevel { get; set; }
    public string? Notes { get; set; }

    // Navigation property
    public Vehicle Vehicle { get; set; } = null!;
}
