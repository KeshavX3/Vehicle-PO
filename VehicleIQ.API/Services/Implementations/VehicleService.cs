using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class VehicleService : IVehicleService
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly AppDbContext _context;

    public VehicleService(IVehicleRepository vehicleRepository, AppDbContext context)
    {
        _vehicleRepository = vehicleRepository;
        _context = context;
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

        // Clean up all related records to avoid FK constraint issues during permanent delete
        var fuelEntries = await _context.FuelEntries.Where(f => f.VehicleId == id).ToListAsync();
        _context.FuelEntries.RemoveRange(fuelEntries);

        var serviceRecords = await _context.ServiceRecords.Where(s => s.VehicleId == id).ToListAsync();
        _context.ServiceRecords.RemoveRange(serviceRecords);

        var insurances = await _context.Insurances.Where(i => i.VehicleId == id).ToListAsync();
        _context.Insurances.RemoveRange(insurances);

        var pucs = await _context.PucCertificates.Where(p => p.VehicleId == id).ToListAsync();
        _context.PucCertificates.RemoveRange(pucs);

        var expenses = await _context.Expenses.Where(e => e.VehicleId == id).ToListAsync();
        _context.Expenses.RemoveRange(expenses);

        var reminders = await _context.Reminders.Where(r => r.VehicleId == id).ToListAsync();
        _context.Reminders.RemoveRange(reminders);

        var documents = await _context.Documents.Where(d => d.VehicleId == id).ToListAsync();
        _context.Documents.RemoveRange(documents);

        await _context.SaveChangesAsync();

        // Hard delete vehicle permanently from DB
        await _vehicleRepository.DeleteAsync(vehicle);
    }
}
