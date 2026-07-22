using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class ServiceRecordService : IServiceRecordService
{
    private readonly IServiceRecordRepository _serviceRecordRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IExpenseService _expenseService;
    private readonly IExpenseRepository _expenseRepository;
    private readonly IReminderRepository _reminderRepository;

    public ServiceRecordService(
        IServiceRecordRepository serviceRecordRepository,
        IVehicleRepository vehicleRepository,
        IExpenseService expenseService,
        IExpenseRepository expenseRepository,
        IReminderRepository reminderRepository)
    {
        _serviceRecordRepository = serviceRecordRepository;
        _vehicleRepository = vehicleRepository;
        _expenseService = expenseService;
        _expenseRepository = expenseRepository;
        _reminderRepository = reminderRepository;
    }

    public async Task<IReadOnlyList<ServiceRecordDto>> GetServiceRecordsByUserIdAsync(int userId)
    {
        var records = await _serviceRecordRepository.GetByUserIdAsync(userId);
        return records.Select(r => r.ToDto()).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyList<ServiceRecordDto>> GetServiceRecordsByVehicleIdAsync(int vehicleId, int userId)
    {
        // Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(vehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} was not found.");
        }

        var records = await _serviceRecordRepository.GetByVehicleIdAsync(vehicleId);
        return records.Select(r => r.ToDto()).ToList().AsReadOnly();
    }

    public async Task<ServiceRecordDto> CreateServiceRecordAsync(CreateServiceRecordRequest request, int userId)
    {
        // 1. Guard: Verify vehicle exists and belongs to user
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(request.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {request.VehicleId} was not found.");
        }

        // 2. Create ServiceRecord Entity
        var record = request.ToEntity();
        var createdRecord = await _serviceRecordRepository.AddAsync(record);

        // 3. Update vehicle's Current Odometer if this reading is higher
        if (request.OdometerReading.HasValue && request.OdometerReading.Value > vehicle.CurrentOdometer)
        {
            vehicle.CurrentOdometer = request.OdometerReading.Value;
            await _vehicleRepository.UpdateAsync(vehicle);
        }

        // 4. Auto-generate corresponding Expense record
        await _expenseService.CreateSystemExpenseAsync(
            userId: userId,
            vehicleId: request.VehicleId,
            date: request.Date,
            category: ExpenseCategory.Service,
            amount: createdRecord.Cost,
            description: $"Maintenance Service: {createdRecord.ServiceType} - {createdRecord.Description ?? "General maintenance"} at {createdRecord.GarageName ?? "Workshop"}",
            referenceType: "ServiceRecord",
            referenceId: createdRecord.Id
        );

        // 5. Auto-schedule a Service Due Reminder if NextServiceDate is specified
        if (createdRecord.NextServiceDate.HasValue)
        {
            var reminder = new Reminder
            {
                UserId = userId,
                VehicleId = request.VehicleId,
                Title = $"Service due for {vehicle.Make} {vehicle.Model}",
                Description = $"Scheduled due date for next service. (Previous service: {createdRecord.ServiceType})",
                DueDate = createdRecord.NextServiceDate.Value,
                ReminderType = ReminderType.ServiceDue,
                Status = ReminderStatus.Pending,
                ReferenceType = "ServiceRecord",
                ReferenceId = createdRecord.Id
            };
            await _reminderRepository.AddAsync(reminder);
        }

        return createdRecord.ToDto();
    }

    public async Task DeleteServiceRecordAsync(int id, int userId)
    {
        var record = await _serviceRecordRepository.GetByIdAsync(id);
        if (record == null)
        {
            throw new NotFoundException($"Service record with ID {id} was not found.");
        }

        // Verify ownership
        var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(record.VehicleId, userId);
        if (vehicle == null)
        {
            throw new NotFoundException($"Associated vehicle was not found.");
        }

        // Delete the service record
        await _serviceRecordRepository.DeleteAsync(record);

        // Clean up the associated auto-generated expense
        var associatedExpenses = await _expenseRepository.GetByVehicleIdAsync(record.VehicleId);
        var expenseToDelete = associatedExpenses.FirstOrDefault(e => e.ReferenceType == "ServiceRecord" && e.ReferenceId == id);
        if (expenseToDelete != null)
        {
            await _expenseRepository.DeleteAsync(expenseToDelete);
        }

        // Clean up the associated auto-scheduled reminder
        var associatedReminders = await _reminderRepository.GetByUserIdAsync(userId, false);
        var reminderToDelete = associatedReminders.FirstOrDefault(r => r.ReferenceType == "ServiceRecord" && r.ReferenceId == id);
        if (reminderToDelete != null)
        {
            await _reminderRepository.DeleteAsync(reminderToDelete);
        }
    }
}
