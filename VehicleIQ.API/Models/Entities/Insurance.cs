using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents a vehicle insurance policy.
/// EndDate feeds into the Reminder system for expiry notifications at 30/15/7 days.
/// </summary>
public class Insurance : BaseEntity
{
    public int VehicleId { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string PolicyNumber { get; set; } = string.Empty;
    public InsuranceCoverageType CoverageType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal PremiumAmount { get; set; }
    public string? Notes { get; set; }

    // Navigation property
    public Vehicle Vehicle { get; set; } = null!;
}
