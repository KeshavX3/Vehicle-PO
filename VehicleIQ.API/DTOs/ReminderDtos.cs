using System.ComponentModel.DataAnnotations;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.DTOs;

public record ReminderDto(
    int Id,
    int UserId,
    int? VehicleId,
    string Title,
    string? Description,
    DateTime DueDate,
    ReminderType ReminderType,
    ReminderStatus Status,
    DateTime? SnoozedUntil,
    string? ReferenceType,
    int? ReferenceId
);

public record CreateReminderRequest(
    int? VehicleId,
    [Required] string Title,
    string? Description,
    [Required] DateTime DueDate,
    [Required] ReminderType ReminderType
);

public record UpdateReminderStatusRequest(
    [Required] ReminderStatus Status,
    DateTime? SnoozedUntil
);
