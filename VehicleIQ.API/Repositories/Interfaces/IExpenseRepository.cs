using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IExpenseRepository : IGenericRepository<Expense>
{
    Task<IReadOnlyList<Expense>> GetByUserIdAsync(int userId);
    Task<IReadOnlyList<Expense>> GetByVehicleIdAsync(int vehicleId);
}
