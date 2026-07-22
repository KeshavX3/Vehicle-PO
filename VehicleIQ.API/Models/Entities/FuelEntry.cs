using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Models.Entities;

/// <summary>
/// Represents a single fuel fill-up event.
/// IsFullTank flag enables accurate mileage calculation using the full-tank-to-full-tank method.
/// CalculatedMileage is computed at write time by the service layer and stored for chart performance.
/// </summary>
public class FuelEntry : BaseEntity
{
    public int VehicleId { get; set; }
    public DateTime Date { get; set; }
    public FuelType FuelType { get; set; }
    public decimal Quantity { get; set; }
    public decimal PricePerLiter { get; set; }
    public decimal TotalCost { get; set; }
    public decimal OdometerReading { get; set; }
    public bool IsFullTank { get; set; } = true;
    public string? FuelStationName { get; set; }
    public string? Notes { get; set; }
    public decimal? CalculatedMileage { get; set; }

    // Navigation property
    public Vehicle Vehicle { get; set; } = null!;
}
