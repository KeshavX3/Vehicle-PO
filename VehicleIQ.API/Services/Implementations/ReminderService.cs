using VehicleIQ.API.DTOs;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class ReminderService : IReminderService
{
    private readonly IReminderRepository _reminderRepository;
    private readonly IVehicleRepository _vehicleRepository;

    public ReminderService(IReminderRepository reminderRepository, IVehicleRepository vehicleRepository)
    {
        _reminderRepository = reminderRepository;
        _vehicleRepository = vehicleRepository;
    }

    public async Task<IReadOnlyList<ReminderDto>> GetRemindersAsync(int userId, bool pendingOnly)
    {
        var reminders = await _reminderRepository.GetByUserIdAsync(userId, pendingOnly);
        return reminders.Select(r => r.ToDto()).ToList().AsReadOnly();
    }

    public async Task<ReminderDto> CreateReminderAsync(CreateReminderRequest request, int userId)
    {
        if (request.VehicleId.HasValue)
        {
            var vehicle = await _vehicleRepository.GetByIdAndUserIdAsync(request.VehicleId.Value, userId);
            if (vehicle == null)
            {
                throw new NotFoundException($"Vehicle with ID {request.VehicleId.Value} was not found.");
            }
        }

        var reminder = request.ToEntity(userId);
        var created = await _reminderRepository.AddAsync(reminder);
        return created.ToDto();
    }

    public async Task<ReminderDto> UpdateReminderStatusAsync(int id, UpdateReminderStatusRequest request, int userId)
    {
        var reminder = await _reminderRepository.GetByIdAsync(id);
        if (reminder == null || reminder.UserId != userId)
        {
            throw new NotFoundException($"Reminder with ID {id} was not found.");
        }

        if (request.Status == ReminderStatus.Snoozed && !request.SnoozedUntil.HasValue)
        {
            throw new BadRequestException("Snoozed status requires a SnoozedUntil timestamp.");
        }

        reminder.Status = request.Status;
        reminder.SnoozedUntil = request.Status == ReminderStatus.Snoozed ? request.SnoozedUntil : null;

        await _reminderRepository.UpdateAsync(reminder);
        return reminder.ToDto();
    }

    public async Task DeleteReminderAsync(int id, int userId)
    {
        var reminder = await _reminderRepository.GetByIdAsync(id);
        if (reminder == null || reminder.UserId != userId)
        {
            throw new NotFoundException($"Reminder with ID {id} was not found.");
        }

        await _reminderRepository.DeleteAsync(reminder);
    }
}
