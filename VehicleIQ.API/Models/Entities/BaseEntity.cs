namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Base class for all entities. Provides Id, CreatedAt, and UpdatedAt.
/// Timestamps are managed automatically by AppDbContext.SaveChangesAsync().
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
