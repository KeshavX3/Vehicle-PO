using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IFuelEntryRepository : IGenericRepository<FuelEntry>
{
    Task<IReadOnlyList<FuelEntry>> GetByVehicleIdAsync(int vehicleId);
    Task<FuelEntry?> GetPreviousFullFuelEntryAsync(int vehicleId, decimal currentOdometer);
}
