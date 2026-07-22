namespace VehicleIQ.API.DTOs.Analytics;

public record FuelAnomalyDto(
    int FuelEntryId,
    DateTime Date,
    double RecordedMileage,
    double BaselineMileage,
    double PercentageDrop,
    string Severity, // "Warning" or "Critical"
    string Recommendation
);

public record ServicePredictionDto(
    int VehicleId,
    string VehicleName,
    int CurrentOdometer,
    int TargetServiceOdometer,
    double AverageDailyKm,
    int DaysUntilService,
    DateTime? EstimatedServiceDate,
    string UrgencyLevel // "Normal", "Upcoming", "Urgent", "Overdue"
);

public record VehicleAnalyticsDto(
    int VehicleId,
    string VehicleName,
    double BaselineMileageKmL,
    double LatestMileageKmL,
    double CostPerKm,
    double TotalDistanceTraveledKm,
    double TotalSpentAmount,
    List<FuelAnomalyDto> FuelAnomalies,
    ServicePredictionDto? ServicePrediction
);

public record FleetSummaryAnalyticsDto(
    int TotalVehicles,
    double TotalFleetSpend,
    double AverageFleetCostPerKm,
    double AverageFleetMileageKmL,
    int ActiveAnomaliesCount,
    int UpcomingServicesCount,
    double ForecastNext30DaysSpend,
    double ForecastNext90DaysSpend,
    List<VehicleAnalyticsDto> VehicleSummaries,
    List<string> KeyRecommendations
);
