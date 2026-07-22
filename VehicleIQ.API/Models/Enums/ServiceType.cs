namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Predefined service types for vehicle maintenance.
/// Other = 99 leaves room for future additions without renumbering.
/// </summary>
public enum ServiceType
{
    OilChange = 0,
    TireRotation = 1,
    BrakePad = 2,
    Battery = 3,
    GeneralService = 4,
    ACService = 5,
    WheelAlignment = 6,
    Other = 99
}
