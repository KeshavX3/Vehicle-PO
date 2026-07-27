using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Data;
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
    private readonly AppDbContext _context;

    public AuthService(IUserRepository userRepository, IJwtService jwtService, AppDbContext context)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _context = context;
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
        var refreshToken = await GenerateAndSaveRefreshTokenAsync(user.Id);

        return new AuthResponseDto(token, refreshToken.Token, user.Id, user.FullName, user.Email, DateTime.UtcNow.AddDays(7));
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
            isValidPassword = false;
        }

        if (!isValidPassword)
        {
            throw new BadRequestException("Invalid email or password.");
        }

        var token = _jwtService.GenerateToken(user);
        var refreshToken = await GenerateAndSaveRefreshTokenAsync(user.Id);

        return new AuthResponseDto(token, refreshToken.Token, user.Id, user.FullName, user.Email, DateTime.UtcNow.AddDays(7));
    }

    public async Task<AuthResponseDto> GetCurrentUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            throw new NotFoundException($"User with ID {userId} not found.");
        }

        var token = _jwtService.GenerateToken(user);
        var activeToken = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.UserId == userId && r.IsRevoked == false && r.ExpiresAt > DateTime.UtcNow);
        string refreshTokenStr = activeToken?.Token ?? (await GenerateAndSaveRefreshTokenAsync(userId)).Token;

        return new AuthResponseDto(token, refreshTokenStr, user.Id, user.FullName, user.Email, DateTime.UtcNow.AddDays(7));
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (storedToken == null || !storedToken.IsActive)
        {
            throw new BadRequestException("Invalid or expired refresh token.");
        }

        var user = await _userRepository.GetByIdAsync(storedToken.UserId);
        if (user == null || !user.IsActive)
        {
            throw new BadRequestException("User account associated with this token is inactive or not found.");
        }

        // Revoke current refresh token and issue a new pair
        storedToken.IsRevoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;

        var newJwtToken = _jwtService.GenerateToken(user);
        var newRefreshToken = await GenerateAndSaveRefreshTokenAsync(user.Id);

        storedToken.ReplacedByToken = newRefreshToken.Token;
        await _context.SaveChangesAsync();

        return new AuthResponseDto(newJwtToken, newRefreshToken.Token, user.Id, user.FullName, user.Email, DateTime.UtcNow.AddDays(7));
    }

    public async Task RevokeTokenAsync(string refreshToken, int userId)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken && r.UserId == userId);

        if (storedToken != null && storedToken.IsActive)
        {
            storedToken.IsRevoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private async Task<RefreshToken> GenerateAndSaveRefreshTokenAsync(int userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var tokenStr = Convert.ToBase64String(randomBytes);

        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = tokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }
}
