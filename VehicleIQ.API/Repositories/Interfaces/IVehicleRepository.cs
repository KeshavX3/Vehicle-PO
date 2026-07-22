using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IVehicleRepository : IGenericRepository<Vehicle>
{
    Task<IReadOnlyList<Vehicle>> GetByUserIdAsync(int userId);
    Task<Vehicle?> GetByIdAndUserIdAsync(int id, int userId);
}
