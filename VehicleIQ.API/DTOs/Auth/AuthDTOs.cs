using System.ComponentModel.DataAnnotations;

namespace VehicleIQ.API.DTOs.Auth;

public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required] string FullName,
    string? Phone
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponseDto(
    string Token,
    int UserId,
    string FullName,
    string Email,
    DateTime ExpiresAt
);
