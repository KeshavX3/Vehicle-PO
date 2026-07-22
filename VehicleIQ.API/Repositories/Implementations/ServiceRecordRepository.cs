using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class ServiceRecordRepository : GenericRepository<ServiceRecord>, IServiceRecordRepository
{
    public ServiceRecordRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<ServiceRecord>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _context.ServiceRecords
            .Where(s => s.VehicleId == vehicleId)
            .OrderByDescending(s => s.Date)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<ServiceRecord>> GetByUserIdAsync(int userId)
    {
        return await _context.ServiceRecords
            .Include(s => s.Vehicle)
            .Where(s => s.Vehicle.UserId == userId)
            .OrderByDescending(s => s.Date)
            .ToListAsync();
    }
}
