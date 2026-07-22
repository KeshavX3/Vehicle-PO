using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class FuelEntryRepository : GenericRepository<FuelEntry>, IFuelEntryRepository
{
    public FuelEntryRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<FuelEntry>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _context.FuelEntries
            .Where(f => f.VehicleId == vehicleId)
            .OrderByDescending(f => f.Date)
            .ThenByDescending(f => f.OdometerReading)
            .ToListAsync();
    }

    public async Task<FuelEntry?> GetPreviousFullFuelEntryAsync(int vehicleId, decimal currentOdometer)
    {
        return await _context.FuelEntries
            .Where(f => f.VehicleId == vehicleId && f.IsFullTank && f.OdometerReading < currentOdometer)
            .OrderByDescending(f => f.OdometerReading)
            .FirstOrDefaultAsync();
    }
}
