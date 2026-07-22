using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IInsuranceRepository : IGenericRepository<Insurance>
{
    Task<IReadOnlyList<Insurance>> GetByVehicleIdAsync(int vehicleId);
    Task<Insurance?> GetActiveInsuranceAsync(int vehicleId);
}
