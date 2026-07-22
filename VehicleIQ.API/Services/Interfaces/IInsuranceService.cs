using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Services.Interfaces;

public interface IInsuranceService
{
    Task<IReadOnlyList<InsuranceDto>> GetInsurancesByVehicleIdAsync(int vehicleId, int userId);
    Task<InsuranceDto> CreateInsuranceAsync(CreateInsuranceRequest request, int userId);
    Task DeleteInsuranceAsync(int id, int userId);
}
