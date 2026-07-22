using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Services.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
