using VehicleIQ.API.DTOs;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Services.Interfaces;

public interface IExpenseService
{
    Task<IReadOnlyList<ExpenseDto>> GetExpensesByUserIdAsync(int userId);
    Task<IReadOnlyList<ExpenseDto>> GetExpensesByVehicleIdAsync(int vehicleId, int userId);
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseRequest request, int userId);
    Task<ExpenseDto> CreateSystemExpenseAsync(
        int userId, 
        int? vehicleId, 
        DateTime date, 
        ExpenseCategory category, 
        decimal amount, 
        string description, 
        string referenceType, 
        int referenceId
    );
    Task DeleteExpenseAsync(int id, int userId);
}
