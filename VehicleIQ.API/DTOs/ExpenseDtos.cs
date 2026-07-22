using System.ComponentModel.DataAnnotations;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.DTOs;

public record ExpenseDto(
    int Id,
    int UserId,
    int? VehicleId,
    DateTime Date,
    ExpenseCategory Category,
    decimal Amount,
    string? Description,
    string? ReferenceType,
    int? ReferenceId
);

public record CreateExpenseRequest(
    int? VehicleId,
    [Required] DateTime Date,
    [Required] ExpenseCategory Category,
    [Range(0.01, 99999999.99)] decimal Amount,
    string? Description
);
