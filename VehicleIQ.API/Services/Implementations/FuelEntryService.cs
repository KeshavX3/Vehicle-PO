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
        var entries = await _fuelEntryRepository.GetByUserIdAsync(userId);
        return entries.Select(e => e.ToDto()).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<FuelEntryDto>> GetFuelEntriesByVehicleIdAsync(int vehicleId, int userId)
    {
        // Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} was not found.");
        }

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

        // 3. Calculate mileage using the full-tank-to-full-tank method
        decimal? calculatedMileage = null;
        if (request.IsFullTank)
        {
            var prevFullEntry = await _fuelEntryRepository.GetPreviousFullFuelEntryAsync(request.VehicleId, request.OdometerReading);
            if (prevFullEntry != null)
            {
                var distanceTraveled = request.OdometerReading - prevFullEntry.OdometerReading;
                if (distanceTraveled > 0 && request.Quantity > 0)
                {
                    calculatedMileage = distanceTraveled / request.Quantity;
                }
            }
        }

        // 4. Create FuelEntry Entity
        var fuelEntry = request.ToEntity();
        fuelEntry.CalculatedMileage = calculatedMileage;

        var createdEntry = await _fuelEntryRepository.AddAsync(fuelEntry);

        // 5. Update vehicle's Current Odometer if this reading is higher
        if (request.OdometerReading > vehicle.CurrentOdometer)
        {
            vehicle.CurrentOdometer = request.OdometerReading;
            await _vehicleRepository.UpdateAsync(vehicle);
        }

        // 6. Auto-generate the corresponding Expense record
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

        return createdEntry.ToDto();
    }

    public async Task DeleteFuelEntryAsync(int id, int userId)
    {
        var fuelEntry = await _fuelEntryRepository.GetByIdAsync(id);
        if (fuelEntry == null)
        {
            throw new NotFoundException($"Fuel entry with ID {id} was not found.");
        }

        // Verify vehicle belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(fuelEntry.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Associated vehicle was not found.");
        }

        // Delete the entry
        await _fuelEntryRepository.DeleteAsync(fuelEntry);

        // Clean up the associated auto-generated expense
        var associatedExpenses = await _expenseRepository.GetByVehicleIdAsync(fuelEntry.VehicleId);
        var expenseToDelete = associatedExpenses.FirstOrDefault(e => e.ReferenceType == "FuelEntry" && e.ReferenceId == id);
        if (expenseToDelete != null)
        {
            // Delete directly bypasses the Service constraint check since we call repository
            await _expenseRepository.DeleteAsync(expenseToDelete);
        }
    }
}
