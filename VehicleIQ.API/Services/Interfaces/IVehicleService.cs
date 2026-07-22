using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Services.Interfaces;

public interface IVehicleService
{
    Task<IReadOnlyList<VehicleDto>> GetVehiclesByUserIdAsync(int userId);
    Task<VehicleDto> GetVehicleByIdAsync(int id, int userId);
    Task<VehicleDto> CreateVehicleAsync(CreateVehicleRequest request, int userId);
    Task<VehicleDto> UpdateVehicleAsync(int id, UpdateVehicleRequest request, int userId);
    Task DeleteVehicleAsync(int id, int userId);
}
