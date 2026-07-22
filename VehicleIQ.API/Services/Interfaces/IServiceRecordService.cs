using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Services.Interfaces;

public interface IServiceRecordService
{
    Task<IReadOnlyList<ServiceRecordDto>> GetServiceRecordsByUserIdAsync(int userId);
    Task<IReadOnlyList<ServiceRecordDto>> GetServiceRecordsByVehicleIdAsync(int vehicleId, int userId);
    Task<ServiceRecordDto> CreateServiceRecordAsync(CreateServiceRecordRequest request, int userId);
    Task DeleteServiceRecordAsync(int id, int userId);
}
