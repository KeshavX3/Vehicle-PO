using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class RemindersController : BaseApiController
{
    private readonly IReminderService _reminderService;

    public RemindersController(IReminderService reminderService)
    {
        _reminderService = reminderService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReminderDto>>> GetReminders([FromQuery] bool pendingOnly = true)
    {
        var reminders = await _reminderService.GetRemindersAsync(CurrentUserId, pendingOnly);
        return Ok(reminders);
    }

    [HttpPost]
    public async Task<ActionResult<ReminderDto>> CreateReminder([FromBody] CreateReminderRequest request)
    {
        var created = await _reminderService.CreateReminderAsync(request, CurrentUserId);
        return CreatedAtAction(null, created);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ReminderDto>> UpdateReminderStatus(int id, [FromBody] UpdateReminderStatusRequest request)
    {
        var updated = await _reminderService.UpdateReminderStatusAsync(id, request, CurrentUserId);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReminder(int id)
    {
        await _reminderService.DeleteReminderAsync(id, CurrentUserId);
        return NoContent();
    }
}
