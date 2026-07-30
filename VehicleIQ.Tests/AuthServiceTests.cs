using Xunit;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Services.Implementations;

namespace VehicleIQ.Tests;

public class AuthServiceTests
{
    [Fact]
    public void BCryptPasswordHashing_VerifiesCorrectly()
    {
        // Arrange
        string password = "TestPassword@123";
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        // Act
        bool isValid = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        bool isInvalid = BCrypt.Net.BCrypt.Verify("WrongPassword", hashedPassword);

        // Assert
        Assert.True(isValid);
        Assert.False(isInvalid);
    }

    [Fact]
    public void JwtService_GenerateToken_CreatesValidJwt()
    {
        // Arrange
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "VehicleIQ_SuperSecret_Key_Min32Chars_2024!!" },
            { "Jwt:Issuer", "VehicleIQ.API" },
            { "Jwt:Audience", "VehicleIQ.React" },
            { "Jwt:ExpiresInDays", "7" }
        };

        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var jwtService = new JwtService(config);
        var user = new User
        {
            Id = 1,
            Email = "engineer@vehicleiq.com",
            FullName = "Senior Engineer"
        };

        // Act
        var token = jwtService.GenerateToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }
}
