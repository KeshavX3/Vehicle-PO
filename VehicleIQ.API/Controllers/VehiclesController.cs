using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class VehiclesController : BaseApiController
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VehicleDto>>> GetVehicles()
    {
        var vehicles = await _vehicleService.GetVehiclesByUserIdAsync(CurrentUserId);
        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VehicleDto>> GetVehicle(int id)
    {
        var vehicle = await _vehicleService.GetVehicleByIdAsync(id, CurrentUserId);
        return Ok(vehicle);
    }

    [HttpPost]
    public async Task<ActionResult<VehicleDto>> CreateVehicle([FromBody] CreateVehicleRequest request)
    {
        var created = await _vehicleService.CreateVehicleAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetVehicle), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VehicleDto>> UpdateVehicle(int id, [FromBody] UpdateVehicleRequest request)
    {
        var updated = await _vehicleService.UpdateVehicleAsync(id, request, CurrentUserId);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        await _vehicleService.DeleteVehicleAsync(id, CurrentUserId);
        return NoContent();
    }
}
