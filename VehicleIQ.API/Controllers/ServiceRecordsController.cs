using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class ServiceRecordsController : BaseApiController
{
    private readonly IServiceRecordService _serviceRecordService;

    public ServiceRecordsController(IServiceRecordService serviceRecordService)
    {
        _serviceRecordService = serviceRecordService;
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<IReadOnlyList<ServiceRecordDto>>> GetServiceRecords(int vehicleId)
    {
        var records = await _serviceRecordService.GetServiceRecordsByVehicleIdAsync(vehicleId, CurrentUserId);
        return Ok(records);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceRecordDto>> CreateServiceRecord([FromBody] CreateServiceRecordRequest request)
    {
        var created = await _serviceRecordService.CreateServiceRecordAsync(request, CurrentUserId);
        return CreatedAtAction(null, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServiceRecord(int id)
    {
        await _serviceRecordService.DeleteServiceRecordAsync(id, CurrentUserId);
        return NoContent();
    }
}
