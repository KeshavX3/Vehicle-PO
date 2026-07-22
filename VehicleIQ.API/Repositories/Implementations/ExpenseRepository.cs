using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class ExpenseRepository : GenericRepository<Expense>, IExpenseRepository
{
    public ExpenseRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Expense>> GetByUserIdAsync(int userId)
    {
        return await _context.Expenses
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Expense>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _context.Expenses
            .Where(e => e.VehicleId == vehicleId)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }
}
