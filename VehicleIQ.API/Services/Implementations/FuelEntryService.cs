using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class FuelEntryService : IFuelEntryService
{
    private readonly IFuelEntryRepository _fuelEntryRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IExpenseService _expenseService;
    private readonly IExpenseRepository _expenseRepository;

    public FuelEntryService(
        IFuelEntryRepository fuelEntryRepository,
        IVehicleRepository vehicleRepository,
        IExpenseService expenseService,
        IExpenseRepository expenseRepository)
    {
        _fuelEntryRepository = fuelEntryRepository;
        _vehicleRepository = vehicleRepository;
        _expenseService = expenseService;
        _expenseRepository = expenseRepository;
    }

    public async Task<IReadOnlyList<FuelEntryDto>> GetFuelEntriesByUserIdAsync(int userId)
    {
        var vehicles = await _vehicleRepository.GetByUserIdAsync(userId);
        foreach (var v in vehicles)
        {
            await RecalculateVehicleMileagesAsync(v.Id);
        }

        var entries = await _fuelEntryRepository.GetByUserIdAsync(userId);
        return entries.Select(e => e.ToDto()).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<FuelEntryDto>> GetFuelEntriesByVehicleIdAsync(int vehicleId, int userId)
    {
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} was not found.");
        }

        await RecalculateVehicleMileagesAsync(vehicleId);

        var entries = await _fuelEntryRepository.GetByVehicleIdAsync(vehicleId);
        return entries.Select(e => e.ToDto()).ToList().AsReadOnly();
    }

    public async Task<FuelEntryDto> CreateFuelEntryAsync(CreateFuelEntryRequest request, int userId)
    {
        // 1. Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(request.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {request.VehicleId} was not found.");
        }

        // 2. Validate Odometer reading
        if (request.OdometerReading <= 0)
        {
            throw new BadRequestException("Odometer reading must be greater than zero.");
        }

        // 3. Create FuelEntry Entity
        var fuelEntry = request.ToEntity();
        var createdEntry = await _fuelEntryRepository.AddAsync(fuelEntry);

        // 4. Update vehicle's Current Odometer if this reading is higher
        if (request.OdometerReading > vehicle.CurrentOdometer)
        {
            vehicle.CurrentOdometer = request.OdometerReading;
            await _vehicleRepository.UpdateAsync(vehicle);
        }

        // 5. Auto-generate the corresponding Expense record
        await _expenseService.CreateSystemExpenseAsync(
            userId: userId,
            vehicleId: request.VehicleId,
            date: request.Date,
            category: ExpenseCategory.Fuel,
            amount: createdEntry.TotalCost,
            description: $"Fuel fill-up: {createdEntry.Quantity}L @ ₹{createdEntry.PricePerLiter}/L at {createdEntry.FuelStationName ?? "Station"}",
            referenceType: "FuelEntry",
            referenceId: createdEntry.Id
        );

        // 6. Recalculate rolling mileage across all fuel entries for this vehicle
        await RecalculateVehicleMileagesAsync(request.VehicleId);

        // Return updated entry from repo
        var freshEntry = await _fuelEntryRepository.GetByIdAsync(createdEntry.Id);
        return (freshEntry ?? createdEntry).ToDto();
    }

    public async Task DeleteFuelEntryAsync(int id, int userId)
    {
        var fuelEntry = await _fuelEntryRepository.GetByIdAsync(id);
        if (fuelEntry == null)
        {
            throw new NotFoundException($"Fuel entry with ID {id} was not found.");
        }

        var vehicleId = fuelEntry.VehicleId;

        // Verify vehicle belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Associated vehicle was not found.");
        }

        // Delete the entry
        await _fuelEntryRepository.DeleteAsync(fuelEntry);

        // Clean up the associated auto-generated expense
        var associatedExpenses = await _expenseRepository.GetByVehicleIdAsync(vehicleId);
        var expenseToDelete = associatedExpenses.FirstOrDefault(e => e.ReferenceType == "FuelEntry" && e.ReferenceId == id);
        if (expenseToDelete != null)
        {
            await _expenseRepository.DeleteAsync(expenseToDelete);
        }

        // Recalculate rolling mileage after deletion
        await RecalculateVehicleMileagesAsync(vehicleId);
    }

    /// <summary>
    /// Recalculates rolling mileage (km/L) chronologically across all entries for a vehicle.
    /// Computes distance / quantity whenever a previous refuel entry exists.
    /// Handles out-of-order date/odometer entries seamlessly.
    /// </summary>
    private async Task RecalculateVehicleMileagesAsync(int vehicleId)
    {
        var entries = (await _fuelEntryRepository.GetByVehicleIdAsync(vehicleId))
            .OrderBy(f => f.OdometerReading)
            .ThenBy(f => f.Date)
            .ToList();

        if (entries.Count == 0) return;

        if (entries.Count == 1)
        {
            if (entries[0].CalculatedMileage != null)
            {
                await _fuelEntryRepository.UpdateCalculatedMileageAsync(entries[0].Id, null);
            }
            return;
        }

        FuelEntry? prevEntry = null;

        foreach (var entry in entries)
        {
            decimal? mileage = null;
            if (prevEntry != null)
            {
                var distance = entry.OdometerReading - prevEntry.OdometerReading;
                if (distance > 0 && entry.Quantity > 0)
                {
                    mileage = Math.Round(distance / entry.Quantity, 2);
                }
            }

            if (entry.CalculatedMileage != mileage)
            {
                await _fuelEntryRepository.UpdateCalculatedMileageAsync(entry.Id, mileage);
            }

            prevEntry = entry;
        }
    }
}
