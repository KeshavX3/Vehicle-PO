namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents an application user. Root entity — all data belongs to a user.
/// Password is stored as a BCrypt hash (never plain text).
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
}
