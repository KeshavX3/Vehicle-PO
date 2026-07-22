using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IDocumentRepository : IGenericRepository<Document>
{
    Task<IReadOnlyList<Document>> GetByUserIdAsync(int userId);
    Task<IReadOnlyList<Document>> GetByVehicleIdAsync(int vehicleId);
}
