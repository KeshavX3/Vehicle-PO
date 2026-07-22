namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Distinguishes manually-created reminders from system-generated ones.
/// Auto-generated reminders link back to their source via ReferenceType/ReferenceId.
/// </summary>
public enum ReminderType
{
    Manual = 0,
    InsuranceExpiry = 1,
    PUCExpiry = 2,
    ServiceDue = 3
}
