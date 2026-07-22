namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Lifecycle states for a reminder.
/// Pending → Snoozed (temporary delay) or Completed/Dismissed (final states).
/// </summary>
public enum ReminderStatus
{
    Pending = 0,
    Snoozed = 1,
    Completed = 2,
    Dismissed = 3
}
