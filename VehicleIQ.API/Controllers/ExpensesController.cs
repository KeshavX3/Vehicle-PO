using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class ExpensesController : BaseApiController
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExpenseDto>>> GetExpenses()
    {
        var expenses = await _expenseService.GetExpensesByUserIdAsync(CurrentUserId);
        return Ok(expenses);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IReadOnlyList<ExpenseDto>>> GetExpensesByVehicle(int vehicleId)
    {
        var expenses = await _expenseService.GetExpensesByVehicleIdAsync(vehicleId, CurrentUserId);
        return Ok(expenses);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseRequest request)
    {
        var created = await _expenseService.CreateExpenseAsync(request, CurrentUserId);
        return CreatedAtAction(null, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        await _expenseService.DeleteExpenseAsync(id, CurrentUserId);
        return NoContent();
    }
}
