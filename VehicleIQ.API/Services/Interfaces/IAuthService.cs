using VehicleIQ.API.DTOs.Auth;

namespace VehicleIQ.API.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequest request);
    Task<AuthResponseDto> LoginAsync(LoginRequest request);
    Task<AuthResponseDto> GetCurrentUserAsync(int userId);
}
