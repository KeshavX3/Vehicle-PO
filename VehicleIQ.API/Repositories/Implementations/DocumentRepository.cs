using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class DocumentRepository : GenericRepository<Document>, IDocumentRepository
{
    public DocumentRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Document>> GetByUserIdAsync(int userId)
    {
        return await _context.Documents
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Document>> GetByVehicleIdAsync(int vehicleId)
    {
        return await _context.Documents
            .Where(d => d.VehicleId == vehicleId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }
}
