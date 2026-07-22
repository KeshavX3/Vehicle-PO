using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IServiceRecordRepository : IGenericRepository<ServiceRecord>
{
    Task<IReadOnlyList<ServiceRecord>> GetByVehicleIdAsync(int vehicleId);
}
