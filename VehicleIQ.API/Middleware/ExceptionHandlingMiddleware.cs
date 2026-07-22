using System.Net;
using System.Text.Json;
using VehicleIQ.API.Exceptions;

namespace VehicleIQ.API.Middleware;

/// <summary>
/// Global exception handling middleware to catch all unhandled exceptions
/// and format them into a consistent JSON response.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = HttpStatusCode.InternalServerError;
        var message = "An internal server error occurred.";
        object? details = null;

        switch (exception)
        {
            case NotFoundException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                message = notFoundEx.Message;
                break;

            case BadRequestException badRequestEx:
                statusCode = HttpStatusCode.BadRequest;
                message = badRequestEx.Message;
                break;

            case ArgumentException argEx:
                statusCode = HttpStatusCode.BadRequest;
                message = argEx.Message;
                break;

            default:
                // For security reasons, don't expose internal exception messages in production
                if (_env.IsDevelopment())
                {
                    message = exception.Message;
                    details = exception.StackTrace;
                }
                break;
        }

        context.Response.StatusCode = (int)statusCode;

        var responseObj = new
        {
            statusCode = context.Response.StatusCode,
            message = message,
            details = details
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonResponse = JsonSerializer.Serialize(responseObj, options);

        return context.Response.WriteAsync(jsonResponse);
    }
}
