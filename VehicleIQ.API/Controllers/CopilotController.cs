using Microsoft.AspNetCore.Mvc;
using VehicleIQ.API.DTOs.Copilot;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Controllers;

/// <summary>
/// AI Copilot endpoint. Requires JWT authentication.
/// Processes natural language queries using Gemini + function calling against the user's fleet data.
/// </summary>
public class CopilotController : BaseApiController
{
    private readonly ICopilotService _copilotService;

    public CopilotController(ICopilotService copilotService)
    {
        _copilotService = copilotService;
    }

    /// <summary>
    /// Send a chat message to VehicleIQ Copilot.
    /// </summary>
    [HttpPost("chat")]
    public async Task<ActionResult<CopilotResponseDto>> Chat([FromBody] CopilotChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Message cannot be empty." });
        }

        var response = await _copilotService.ProcessChatAsync(CurrentUserId, request);
        return Ok(response);
    }
}
