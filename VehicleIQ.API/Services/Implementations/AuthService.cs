using VehicleIQ.API.DTOs.Auth;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public AuthService(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new BadRequestException($"User with email '{request.Email}' already exists.");
        }

        var user = new User
        {
            Email = request.Email.ToLowerInvariant().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        var token = _jwtService.GenerateToken(user);
        return new AuthResponseDto(token, user.Id, user.FullName, user.Email, DateTime.UtcNow.AddDays(7));
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.ToLowerInvariant().Trim());
        if (user == null || !user.IsActive)
        {
            throw new BadRequestException("Invalid email or password.");
        }

        bool isValidPassword = false;
        try
        {
            isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            isValidPassword = user.PasswordHash == request.Password;
        }

        if (!isValidPassword)
        {
            throw new BadRequestException("Invalid email or password.");
        }

        var token = _jwtService.GenerateToken(user);
        return new AuthResponseDto(token, user.Id, user.FullName, user.Email, DateTime.UtcNow.AddDays(7));
    }

    public async Task<AuthResponseDto> GetCurrentUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            throw new NotFoundException($"User with ID {userId} not found.");
        }

        var token = _jwtService.GenerateToken(user);
        return new AuthResponseDto(token, user.Id, user.FullName, user.Email, DateTime.UtcNow.AddDays(7));
    }
}
