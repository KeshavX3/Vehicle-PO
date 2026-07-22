using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class PucCertificateRepository : GenericRepository<PucCertificate>, IPucCertificateRepository
{
    public PucCertificateRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<PucCertificate>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _context.PucCertificates
            .Where(p => p.VehicleId == vehicleId)
            .OrderByDescending(p => p.ExpiryDate)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<PucCertificate>> GetByUserIdAsync(int userId)
    {
        return await _context.PucCertificates
            .Include(p => p.Vehicle)
            .Where(p => p.Vehicle.UserId == userId)
            .OrderByDescending(p => p.ExpiryDate)
            .ToListAsync();
    }

    public async Task<PucCertificate?> GetActivePucAsync(int vehicleId)
    {
        var now = DateTime.UtcNow;
        return await _context.PucCertificates
            .Where(p => p.VehicleId == vehicleId && p.Date <= now && p.ExpiryDate >= now)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();
    }
}
