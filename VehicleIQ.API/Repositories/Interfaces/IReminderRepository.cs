using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Repositories.Interfaces;

public interface IReminderRepository : IGenericRepository<Reminder>
{
    Task<IReadOnlyList<Reminder>> GetByUserIdAsync(int userId, bool pendingOnly);
}
