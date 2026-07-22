using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class FuelEntriesController : BaseApiController
{
    private readonly IFuelEntryService _fuelEntryService;

    public FuelEntriesController(IFuelEntryService fuelEntryService)
    {
        _fuelEntryService = fuelEntryService;
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IReadOnlyList<FuelEntryDto>>> GetFuelEntries(int vehicleId)
    {
        var entries = await _fuelEntryService.GetFuelEntriesByVehicleIdAsync(vehicleId, CurrentUserId);
        return Ok(entries);
    }

    [HttpPost]
    public async Task<ActionResult<FuelEntryDto>> CreateFuelEntry([FromBody] CreateFuelEntryRequest request)
    {
        var created = await _fuelEntryService.CreateFuelEntryAsync(request, CurrentUserId);
        return CreatedAtAction(null, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFuelEntry(int id)
    {
        await _fuelEntryService.DeleteFuelEntryAsync(id, CurrentUserId);
        return NoContent();
    }
}
