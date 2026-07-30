namespace VehicleIQ.API.DTOs.Copilot;

/// <summary>
/// Incoming chat request from the frontend Copilot UI.
/// </summary>
public record CopilotChatRequest(
    string Message,
    string? PageContext,
    List<CopilotMessage>? ConversationHistory
);

/// <summary>
/// A single message in the conversation history.
/// </summary>
public record CopilotMessage(
    string Role,    // "user" or "assistant"
    string Content
);

/// <summary>
/// Response returned to the frontend after AI processing.
/// </summary>
public record CopilotResponseDto(
    string Message,
    string? FunctionCalled,
    object? StructuredData
);

/// <summary>
/// Vehicle Health Score result used by the Copilot and dashboard.
/// </summary>
public record VehicleHealthScoreDto(
    int VehicleId,
    string VehicleName,
    int Score,
    string Tier,           // "Excellent", "Good", "Average", "Needs Attention", "Critical"
    string TierEmoji,      // 🟢, 🟡, 🟠, 🔴
    List<string> Deductions
);
