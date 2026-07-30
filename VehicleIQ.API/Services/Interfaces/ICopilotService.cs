using VehicleIQ.API.DTOs.Copilot;

namespace VehicleIQ.API.Services.Interfaces;

public interface ICopilotService
{
    Task<CopilotResponseDto> ProcessChatAsync(int userId, CopilotChatRequest request);
}
