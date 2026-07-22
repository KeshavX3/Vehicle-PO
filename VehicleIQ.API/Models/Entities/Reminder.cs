using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents a notification/reminder for the user.
/// Can be manually created or auto-generated from insurance/PUC expiry and service schedules.
/// Status tracks the reminder lifecycle: Pending → Snoozed/Completed/Dismissed.
/// </summary>
public class Reminder : BaseEntity
{
    public int UserId { get; set; }
    public int? VehicleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public ReminderType ReminderType { get; set; }
    public ReminderStatus Status { get; set; } = ReminderStatus.Pending;
    public DateTime? SnoozedUntil { get; set; }
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Vehicle? Vehicle { get; set; }
}
