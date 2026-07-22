using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Services.Interfaces;

public interface IPucCertificateService
{
    Task<IReadOnlyList<PucCertificateDto>> GetPucsByVehicleIdAsync(int vehicleId, int userId);
    Task<PucCertificateDto> CreatePucCertificateAsync(CreatePucCertificateRequest request, int userId);
    Task DeletePucCertificateAsync(int id, int userId);
}
