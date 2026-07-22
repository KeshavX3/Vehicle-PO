namespace VehicleIQ.API.DTOs;

public record UserDto(
    int Id,
    string Email,
    string FullName,
    string? Phone,
    string? AvatarUrl,
    bool IsActive
);
