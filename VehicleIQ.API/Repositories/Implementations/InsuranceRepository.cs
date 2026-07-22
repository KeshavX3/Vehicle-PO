using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class InsuranceRepository : GenericRepository<Insurance>, IInsuranceRepository
{
    public InsuranceRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Insurance>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _context.Insurances
            .Where(i => i.VehicleId == vehicleId)
            .OrderByDescending(i => i.EndDate)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Insurance>> GetByUserIdAsync(int userId)
    {
        return await _context.Insurances
            .Include(i => i.Vehicle)
            .Where(i => i.Vehicle.UserId == userId)
            .OrderByDescending(i => i.EndDate)
            .ToListAsync();
    }

    public async Task<Insurance?> GetActiveInsuranceAsync(int vehicleId)
    {
        var now = DateTime.UtcNow;
        return await _context.Insurances
            .Where(i => i.VehicleId == vehicleId && i.StartDate <= now && i.EndDate >= now)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync();
    }
}
