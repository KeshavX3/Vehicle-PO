using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IPucCertificateRepository : IGenericRepository<PucCertificate>
{
    Task<IReadOnlyList<PucCertificate>> GetByVehicleIdAsync(int vehicleId);
    Task<IReadOnlyList<PucCertificate>> GetByUserIdAsync(int userId);
    Task<PucCertificate?> GetActivePucAsync(int vehicleId);
}
