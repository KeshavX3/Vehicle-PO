using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents a user's vehicle. Central entity that connects to all tracking modules.
/// Supports soft delete — IsDeleted flag preserves historical data.
/// CurrentOdometer is a denormalized field updated by service/fuel entries for read performance.
/// </summary>
public class Vehicle : BaseEntity
{
    public int UserId { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty;
    public VehicleType VehicleType { get; set; }
    public FuelType FuelType { get; set; }
    public string? Color { get; set; }
    public decimal CurrentOdometer { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsDeleted { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<FuelEntry> FuelEntries { get; set; } = new List<FuelEntry>();
    public ICollection<ServiceRecord> ServiceRecords { get; set; } = new List<ServiceRecord>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Insurance> Insurances { get; set; } = new List<Insurance>();
    public ICollection<PucCertificate> PucCertificates { get; set; } = new List<PucCertificate>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
}
