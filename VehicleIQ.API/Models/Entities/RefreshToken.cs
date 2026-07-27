namespace VehicleIQ.API.Models.Entities;

public class RefreshToken : BaseEntity
{
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }

    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;

    public User User { get; set; } = null!;
}
