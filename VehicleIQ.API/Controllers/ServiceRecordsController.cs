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

    [HttpGet]
    public async Task<IActionResult> GetAllServiceRecords([FromQuery] PaginationParams? pagination)
    {
        var records = await _serviceRecordService.GetServiceRecordsByUserIdAsync(CurrentUserId);
        if (pagination != null && (pagination.PageNumber > 1 || Request.Query.ContainsKey("pageSize")))
        {
            var paged = records.Skip((pagination.PageNumber - 1) * pagination.PageSize).Take(pagination.PageSize).ToList();
            return Ok(PagedResult<ServiceRecordDto>.Create(paged, records.Count, pagination.PageNumber, pagination.PageSize));
        }
        return Ok(records);
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
