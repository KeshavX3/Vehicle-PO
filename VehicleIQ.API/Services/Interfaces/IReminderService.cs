using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Services.Interfaces;

public interface IReminderService
{
    Task<IReadOnlyList<ReminderDto>> GetRemindersAsync(int userId, bool pendingOnly);
    Task<ReminderDto> CreateReminderAsync(CreateReminderRequest request, int userId);
    Task<ReminderDto> UpdateReminderStatusAsync(int id, UpdateReminderStatusRequest request, int userId);
    Task DeleteReminderAsync(int id, int userId);
}
