using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs.Analytics;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

public class AnalyticsController : BaseApiController
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<FleetSummaryAnalyticsDto>> GetFleetSummary()
    {
        var summary = await _analyticsService.GetFleetSummaryAnalyticsAsync(CurrentUserId);
        return Ok(summary);
    }

    [HttpGet("vehicle/{vehicleId}")]
    public async Task<ActionResult<VehicleAnalyticsDto>> GetVehicleAnalytics(int vehicleId)
    {
        var analytics = await _analyticsService.GetVehicleAnalyticsAsync(vehicleId, CurrentUserId);
        return Ok(analytics);
    }
}
