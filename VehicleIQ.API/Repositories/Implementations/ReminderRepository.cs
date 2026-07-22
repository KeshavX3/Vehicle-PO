using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;
using VehicleIQ.API.Repositories.Interfaces;

namespace VehicleIQ.API.Repositories.Implementations;

public class ReminderRepository : GenericRepository<Reminder>, IReminderRepository
{
    public ReminderRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Reminder>> GetByUserIdAsync(int userId, bool pendingOnly)
    {
        var query = _context.Reminders.Where(r => r.UserId == userId);

        if (pendingOnly)
        {
            query = query.Where(r => r.Status == ReminderStatus.Pending || r.Status == ReminderStatus.Snoozed);
        }

        return await query
            .OrderBy(r => r.DueDate)
            .ToListAsync();
    }
}
