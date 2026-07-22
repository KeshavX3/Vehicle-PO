using VehicleIQ.API.DTOs.Analytics;

namespace VehicleIQ.API.Services.Interfaces;

public interface IAnalyticsService
{
    Task<VehicleAnalyticsDto> GetVehicleAnalyticsAsync(int vehicleId, int userId);
    Task<FleetSummaryAnalyticsDto> GetFleetSummaryAnalyticsAsync(int userId);
}
