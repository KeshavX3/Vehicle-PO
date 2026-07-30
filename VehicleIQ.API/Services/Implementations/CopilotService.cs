using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using VehicleIQ.API.DTOs.Copilot;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

/// <summary>
/// Orchestrates AI chat using Google Gemini REST API with function calling.
/// Flow: User message → Gemini → Function call → Dispatch to existing services → Gemini explains results.
/// The LLM never generates SQL — only receives structured JSON from backend services.
/// </summary>
public class CopilotService : ICopilotService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly CopilotFunctionDispatcher _functionDispatcher;
    private readonly PromptBuilder _promptBuilder;
    private readonly ILogger<CopilotService> _logger;

    private const int MaxFunctionCallIterations = 5;

    public CopilotService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        CopilotFunctionDispatcher functionDispatcher,
        PromptBuilder promptBuilder,
        ILogger<CopilotService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("GeminiClient");
        _configuration = configuration;
        _functionDispatcher = functionDispatcher;
        _promptBuilder = promptBuilder;
        _logger = logger;
    }

    public async Task<CopilotResponseDto> ProcessChatAsync(int userId, CopilotChatRequest request)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        var model = _configuration["Gemini:Model"] ?? "gemini-1.5-flash";

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_GEMINI_API_KEY")
        {
            return new CopilotResponseDto(
                "⚠️ **VehicleIQ Copilot is not configured yet.** Please add your Google Gemini API key in `appsettings.json` under `Gemini:ApiKey` to enable AI features.\n\nGet a free API key at: https://aistudio.google.com/apikey",
                null, null);
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        // Build conversation contents
        var contents = new List<object>();

        // Add conversation history
        if (request.ConversationHistory != null)
        {
            foreach (var msg in request.ConversationHistory)
            {
                contents.Add(new
                {
                    role = msg.Role == "assistant" ? "model" : "user",
                    parts = new[] { new { text = msg.Content } }
                });
            }
        }

        // Add current user message
        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = request.Message } }
        });

        // Build request payload with system instruction and function declarations
        var systemPrompt = _promptBuilder.BuildSystemPrompt(request.PageContext);
        var functionDeclarations = CopilotFunctionDispatcher.GetFunctionDeclarations();

        // List of models to try in case one returns 404
        var modelsToTry = new[] { model, "gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-1.5-flash" }
            .Distinct()
            .ToArray();

        string? lastFunctionCalled = null;

        // Function calling loop — Gemini may request multiple function calls in sequence
        for (int iteration = 0; iteration < MaxFunctionCallIterations; iteration++)
        {
            var requestPayload = new
            {
                system_instruction = new { parts = new[] { new { text = systemPrompt } } },
                contents,
                tools = new[]
                {
                    new { function_declarations = functionDeclarations }
                },
                generation_config = new
                {
                    temperature = 0.4,
                    max_output_tokens = 2048,
                    top_p = 0.95,
                }
            };

            var jsonPayload = JsonSerializer.Serialize(requestPayload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });

            HttpResponseMessage? response = null;
            string? responseBody = null;
            string? workingModel = null;

            // Try models in sequence until one succeeds
            foreach (var targetModel in modelsToTry)
            {
                var endpoints = new[]
                {
                    $"https://generativelanguage.googleapis.com/v1beta/models/{targetModel}:generateContent?key={apiKey}",
                    $"https://generativelanguage.googleapis.com/v1beta/models/{targetModel}:generateContent",
                    $"https://generativelanguage.googleapis.com/v1/models/{targetModel}:generateContent?key={apiKey}",
                    $"https://generativelanguage.googleapis.com/v1/models/{targetModel}:generateContent"
                };

                bool success = false;
                foreach (var targetUrl in endpoints)
                {
                    var req = new HttpRequestMessage(HttpMethod.Post, targetUrl)
                    {
                        Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
                    };

                    // Add Google API Key headers (supports both AIzaSy keys and AQ. Antigravity/Developer keys)
                    req.Headers.TryAddWithoutValidation("x-goog-api-key", apiKey);
                    req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                    try
                    {
                        var res = await _httpClient.SendAsync(req);
                        var body = await res.Content.ReadAsStringAsync();

                        if (res.IsSuccessStatusCode)
                        {
                            response = res;
                            responseBody = body;
                            workingModel = targetModel;
                            success = true;
                            break;
                        }
                        else
                        {
                            _logger.LogWarning("Gemini API endpoint {Url} returned {StatusCode}: {Body}", targetUrl, res.StatusCode, body);
                            response = res;
                            responseBody = body;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed connecting to {Url}", targetUrl);
                    }
                }

                if (success) break;
            }

            if (response == null || !response.IsSuccessStatusCode || string.IsNullOrEmpty(responseBody))
            {
                var statusCode = response != null ? (int)response.StatusCode : 500;
                var hint = apiKey.StartsWith("AIzaSy")
                    ? $"HTTP {statusCode} error from Google AI service."
                    : $"The provided API key does not appear to be a standard Google AI Studio key (which usually starts with `AIzaSy...`).";

                return new CopilotResponseDto(
                    $"⚠️ **Gemini API Error (HTTP {statusCode})**\n\n{hint}\n\nKey used: `{apiKey[..Math.Min(10, apiKey.Length)]}...`\n\nPlease check your key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and update `VehicleIQ.API/appsettings.json`.",
                    null, null);
            }

            // Parse Gemini response
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;

            if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                return new CopilotResponseDto(
                    "I wasn't able to generate a response. Please try rephrasing your question.",
                    null, null);
            }

            var candidate = candidates[0];
            var content = candidate.GetProperty("content");
            var parts = content.GetProperty("parts");

            // Check if Gemini is requesting a function call
            var firstPart = parts[0];
            if (firstPart.TryGetProperty("functionCall", out var functionCall))
            {
                var functionName = functionCall.GetProperty("name").GetString()!;
                JsonElement? args = functionCall.TryGetProperty("args", out var argsEl) ? argsEl : null;

                _logger.LogInformation("Copilot calling function: {FunctionName} for user {UserId}", functionName, userId);
                lastFunctionCalled = functionName;

                // Dispatch to our backend services
                string functionResult;
                try
                {
                    functionResult = await _functionDispatcher.DispatchAsync(functionName, args, userId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error executing function {FunctionName}", functionName);
                    functionResult = JsonSerializer.Serialize(new { error = $"Function failed: {ex.Message}" });
                }

                // Add model's function call to conversation
                contents.Add(new
                {
                    role = "model",
                    parts = new object[] { new { functionCall = new { name = functionName, args = args.HasValue ? (object)args.Value : new { } } } }
                });

                // Add function response to conversation
                contents.Add(new
                {
                    role = "user",
                    parts = new object[]
                    {
                        new
                        {
                            functionResponse = new
                            {
                                name = functionName,
                                response = new { result = JsonSerializer.Deserialize<JsonElement>(functionResult) }
                            }
                        }
                    }
                });

                // Continue loop — Gemini will now generate a text response (or call another function)
                continue;
            }

            // Text response — we're done
            if (firstPart.TryGetProperty("text", out var textElement))
            {
                return new CopilotResponseDto(
                    textElement.GetString() ?? "I processed your request but couldn't generate a response.",
                    lastFunctionCalled,
                    null);
            }

            return new CopilotResponseDto(
                "I received an unexpected response format. Please try again.",
                lastFunctionCalled, null);
        }

        // Max iterations reached
        return new CopilotResponseDto(
            "I needed too many data lookups to answer your question. Try asking something more specific.",
            lastFunctionCalled, null);
    }
}
