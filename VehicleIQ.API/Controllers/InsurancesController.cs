using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class InsurancesController : BaseApiController
{
    private readonly IInsuranceService _insuranceService;

    public InsurancesController(IInsuranceService insuranceService)
    {
        _insuranceService = insuranceService;
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IReadOnlyList<InsuranceDto>>> GetInsurances(int vehicleId)
    {
        var insurances = await _insuranceService.GetInsurancesByVehicleIdAsync(vehicleId, CurrentUserId);
        return Ok(insurances);
    }

    [HttpPost]
    public async Task<ActionResult<InsuranceDto>> CreateInsurance([FromBody] CreateInsuranceRequest request)
    {
        var created = await _insuranceService.CreateInsuranceAsync(request, CurrentUserId);
        return CreatedAtAction(null, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInsurance(int id)
    {
        await _insuranceService.DeleteInsuranceAsync(id, CurrentUserId);
        return NoContent();
    }
}
