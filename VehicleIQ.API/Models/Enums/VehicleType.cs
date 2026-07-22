namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Represents the type/category of a vehicle.
/// Stored as int in the database for performance.
/// </summary>
public enum VehicleType
{
    Car = 0,
    Bike = 1,
    Scooter = 2,
    Truck = 3,
    SUV = 4
}
