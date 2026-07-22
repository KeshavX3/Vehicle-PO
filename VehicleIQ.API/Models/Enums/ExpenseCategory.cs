namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Categories for the unified Expense table.
/// Fuel/Service/Insurance/PUC entries auto-create expenses with these categories.
/// Toll, Parking, Fine, etc. are for manual expense entries.
/// </summary>
public enum ExpenseCategory
{
    Fuel = 0,
    Service = 1,
    Insurance = 2,
    PUC = 3,
    Toll = 4,
    Parking = 5,
    Fine = 6,
    Accessory = 7,
    Wash = 8,
    Other = 99
}
