namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Insurance coverage levels common in India.
/// ThirdParty: Mandatory minimum coverage.
/// Comprehensive: Covers own damage + third party.
/// ZeroDep: Comprehensive with zero depreciation.
/// </summary>
public enum InsuranceCoverageType
{
    ThirdParty = 0,
    Comprehensive = 1,
    ZeroDep = 2
}
