using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Services.Interfaces;

public interface IFuelEntryService
{
    Task<IReadOnlyList<FuelEntryDto>> GetFuelEntriesByVehicleIdAsync(int vehicleId, int userId);
    Task<FuelEntryDto> CreateFuelEntryAsync(CreateFuelEntryRequest request, int userId);
    Task DeleteFuelEntryAsync(int id, int userId);
}
