using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Unified financial view — every monetary transaction flows here.
/// Auto-created by fuel/service/insurance/PUC entries via ReferenceType + ReferenceId.
/// Manual expenses (tolls, parking, fines) have null references.
/// UserId is denormalized from Vehicle for query performance on analytics.
/// </summary>
public class Expense : BaseEntity
{
    public int UserId { get; set; }
    public int? VehicleId { get; set; }
    public DateTime Date { get; set; }
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Vehicle? Vehicle { get; set; }
}
