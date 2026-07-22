using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepository;

    public VehicleService(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;
    }

    public async Task<IReadOnlyList<VehicleDto>> GetVehiclesByUserIdAsync(int userId)
    {
        var vehicles = await _vehicleRepository.GetByUserIdAsync(userId);
        return vehicles.Select(v => v.ToDto()).ToList().AsReadOnly();
    }

    public async Task<VehicleDto> GetVehicleByIdAsync(int id, int userId)
    {
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(id, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {id} was not found.");
        }
        return vehicle.ToDto();
    }

    public async Task<VehicleDto> CreateVehicleAsync(CreateVehicleRequest request, int userId)
    {
        var vehicle = request.ToEntity(userId);
        var createdVehicle = await _vehicleRepository.AddAsync(vehicle);
        return createdVehicle.ToDto();
    }

    public async Task<VehicleDto> UpdateVehicleAsync(int id, UpdateVehicleRequest request, int userId)
    {
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(id, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {id} was not found.");
        }

        request.UpdateEntity(vehicle);
        await _vehicleRepository.UpdateAsync(vehicle);

        return vehicle.ToDto();
    }

    public async Task DeleteVehicleAsync(int id, int userId)
    {
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(id, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {id} was not found.");
        }

        // Soft delete
        vehicle.IsDeleted = true;
        await _vehicleRepository.UpdateAsync(vehicle);
    }
}
