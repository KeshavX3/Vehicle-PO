using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class VehicleRepository : GenericRepository<Vehicle>, IVehicleRepository
{
    public VehicleRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Vehicle>> GetByUserIdAsync(int userId)
    {
        return await _context.Vehicles
            .Where(v => v.UserId == userId)
            .ToListAsync();
    }

    public async Task<Vehicle?> GetByIdAndUserIdAsync(int id, int userId)
    {
        return await _context.Vehicles
            .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);
    }
}
