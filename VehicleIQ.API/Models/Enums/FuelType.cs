namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Represents the fuel type of a vehicle or fuel entry.
/// A vehicle's FuelType is its primary fuel, but individual
/// fuel entries can differ (e.g., CNG/Petrol hybrid).
/// </summary>
public enum FuelType
{
    Petrol = 0,
    Diesel = 1,
    CNG = 2,
    Electric = 3,
    Hybrid = 4
}
