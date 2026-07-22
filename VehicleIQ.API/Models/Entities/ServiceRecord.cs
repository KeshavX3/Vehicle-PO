using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents a vehicle service/maintenance event.
/// NextServiceDate and NextServiceOdometer feed into the Reminder system
/// for proactive service notifications.
/// </summary>
public class ServiceRecord : BaseEntity
{
    public int VehicleId { get; set; }
    public DateTime Date { get; set; }
    public ServiceType ServiceType { get; set; }
    public string? Description { get; set; }
    public decimal Cost { get; set; }
    public decimal? OdometerReading { get; set; }
    public string? GarageName { get; set; }
    public DateTime? NextServiceDate { get; set; }
    public decimal? NextServiceOdometer { get; set; }
    public string? Notes { get; set; }

    // Navigation property
    public Vehicle Vehicle { get; set; } = null!;
}
