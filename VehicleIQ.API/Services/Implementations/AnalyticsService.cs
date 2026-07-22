using VehicleIQ.API.DTOs.Analytics;
using VehicleIQ.API.Exceptions;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Services.Interfaces;

namespace VehicleIQ.API.Services.Implementations;

public class AnalyticsService : IAnalyticsService
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IFuelEntryRepository _fuelEntryRepository;
    private readonly IExpenseRepository _expenseRepository;
    private readonly IServiceRecordRepository _serviceRecordRepository;

    public AnalyticsService(
        IVehicleRepository vehicleRepository,
        IFuelEntryRepository fuelEntryRepository,
        IExpenseRepository expenseRepository,
        IServiceRecordRepository serviceRecordRepository)
    {
        _vehicleRepository = vehicleRepository;
        _fuelEntryRepository = fuelEntryRepository;
        _expenseRepository = expenseRepository;
        _serviceRecordRepository = serviceRecordRepository;
    }

    public async Task<VehicleAnalyticsDto> GetVehicleAnalyticsAsync(int vehicleId, int userId)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(vehicleId);
        if (vehicle == null || vehicle.UserId != userId)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} not found.");
        }

        var fuelEntries = (await _fuelEntryRepository.GetByVehicleIdAsync(vehicleId))
            .OrderBy(f => f.Date)
            .ToList();

        var expenses = await _expenseRepository.GetByVehicleIdAsync(vehicleId);
        var serviceRecords = await _serviceRecordRepository.GetByVehicleIdAsync(vehicleId);

        // 1. Calculate Fuel Baseline & Anomalies
        var validMileages = fuelEntries
            .Where(f => f.CalculatedMileage.HasValue && f.CalculatedMileage > 0)
            .Select(f => (double)f.CalculatedMileage!.Value)
            .ToList();

        double baselineMileage = validMileages.Count > 0 ? validMileages.Average() : 0.0;
        double latestMileage = validMileages.Count > 0 ? validMileages.Last() : 0.0;

        var anomalies = new List<FuelAnomalyDto>();
        if (baselineMileage > 0)
        {
            foreach (var entry in fuelEntries.Where(f => f.CalculatedMileage.HasValue))
            {
                double mileage = (double)entry.CalculatedMileage!.Value;
                var dropPercent = ((baselineMileage - mileage) / baselineMileage) * 100.0;

                if (dropPercent >= 15.0)
                {
                    string severity = dropPercent >= 25.0 ? "Critical" : "Warning";
                    string recommendation = dropPercent >= 25.0
                        ? "Significant efficiency drop detected. Inspect for fuel leaks, engine misfire, or severe tire under-inflation."
                        : "Efficiency is below baseline. Check tire pressure, clean air filter, and review recent driving conditions.";

                    anomalies.Add(new FuelAnomalyDto(
                        entry.Id,
                        entry.Date,
                        Math.Round(mileage, 2),
                        Math.Round(baselineMileage, 2),
                        Math.Round(dropPercent, 1),
                        severity,
                        recommendation
                    ));
                }
            }
        }

        // 2. Cost Per Km (CPK)
        double totalSpent = (double)expenses.Sum(e => e.Amount);
        double minOdo = fuelEntries.Count > 0 ? (double)fuelEntries.Min(f => f.OdometerReading) : (double)vehicle.CurrentOdometer;
        double maxOdo = Math.Max((double)vehicle.CurrentOdometer, fuelEntries.Count > 0 ? (double)fuelEntries.Max(f => f.OdometerReading) : 0.0);
        double distanceDriven = maxOdo - minOdo;
        double cpk = distanceDriven > 0 ? totalSpent / distanceDriven : 0.0;

        // 3. Predictive Service Due
        ServicePredictionDto? servicePrediction = null;
        var nextServiceRecord = serviceRecords
            .Where(s => s.NextServiceOdometer.HasValue && (double)s.NextServiceOdometer.Value > (double)vehicle.CurrentOdometer)
            .OrderBy(s => s.NextServiceOdometer)
            .FirstOrDefault();

        int targetServiceOdo = nextServiceRecord?.NextServiceOdometer.HasValue == true
            ? (int)nextServiceRecord.NextServiceOdometer.Value
            : (int)(vehicle.CurrentOdometer + 5000);

        double avgDailyKm = 25.0; // Default estimate
        if (fuelEntries.Count >= 2)
        {
            var firstEntry = fuelEntries.First();
            var lastEntry = fuelEntries.Last();
            var totalDays = (lastEntry.Date - firstEntry.Date).TotalDays;
            if (totalDays > 0)
            {
                avgDailyKm = ((double)lastEntry.OdometerReading - (double)firstEntry.OdometerReading) / totalDays;
                if (avgDailyKm <= 0) avgDailyKm = 25.0;
            }
        }

        double remainingKm = targetServiceOdo - (double)vehicle.CurrentOdometer;
        int daysUntilService = (int)Math.Max(0, Math.Ceiling(remainingKm / avgDailyKm));
        DateTime estimatedDate = DateTime.UtcNow.AddDays(daysUntilService);

        string urgency = remainingKm <= 0 ? "Overdue"
            : remainingKm <= 500 ? "Urgent"
            : remainingKm <= 1500 ? "Upcoming"
            : "Normal";

        servicePrediction = new ServicePredictionDto(
            vehicle.Id,
            $"{vehicle.Make} {vehicle.Model}",
            (int)vehicle.CurrentOdometer,
            targetServiceOdo,
            Math.Round(avgDailyKm, 1),
            daysUntilService,
            estimatedDate,
            urgency
        );

        return new VehicleAnalyticsDto(
            vehicle.Id,
            $"{vehicle.Make} {vehicle.Model}",
            Math.Round(baselineMileage, 2),
            Math.Round(latestMileage, 2),
            Math.Round(cpk, 2),
            Math.Round(distanceDriven, 1),
            Math.Round(totalSpent, 2),
            anomalies,
            servicePrediction
        );
    }

    public async Task<FleetSummaryAnalyticsDto> GetFleetSummaryAnalyticsAsync(int userId)
    {
        var vehicles = await _vehicleRepository.GetByUserIdAsync(userId);
        var allExpenses = await _expenseRepository.GetByUserIdAsync(userId);

        var vehicleSummaries = new List<VehicleAnalyticsDto>();
        foreach (var v in vehicles)
        {
            try
            {
                var analytics = await GetVehicleAnalyticsAsync(v.Id, userId);
                vehicleSummaries.Add(analytics);
            }
            catch
            {
                // Skip deleted or inaccessible vehicles
            }
        }

        int totalVehicles = vehicles.Count;
        double totalFleetSpend = (double)allExpenses.Sum(e => e.Amount);
        double avgFleetCpk = vehicleSummaries.Count > 0 ? vehicleSummaries.Where(s => s.CostPerKm > 0).Select(s => s.CostPerKm).DefaultIfEmpty(0).Average() : 0.0;
        double avgFleetMileage = vehicleSummaries.Count > 0 ? vehicleSummaries.Where(s => s.BaselineMileageKmL > 0).Select(s => s.BaselineMileageKmL).DefaultIfEmpty(0).Average() : 0.0;

        int activeAnomaliesCount = vehicleSummaries.Sum(s => s.FuelAnomalies.Count);
        int upcomingServicesCount = vehicleSummaries.Count(s => s.ServicePrediction != null && (s.ServicePrediction.UrgencyLevel == "Urgent" || s.ServicePrediction.UrgencyLevel == "Upcoming" || s.ServicePrediction.UrgencyLevel == "Overdue"));

        var last60DaysSpend = (double)allExpenses
            .Where(e => e.Date >= DateTime.UtcNow.AddDays(-60))
            .Sum(e => e.Amount);

        double monthlySpendRunRate = last60DaysSpend > 0 ? last60DaysSpend / 2.0 : totalFleetSpend > 0 ? totalFleetSpend / 3.0 : 0.0;
        double forecast30Days = Math.Round(monthlySpendRunRate, 2);
        double forecast90Days = Math.Round(monthlySpendRunRate * 3.0, 2);

        var recommendations = new List<string>();
        if (activeAnomaliesCount > 0)
        {
            recommendations.Add($"⚠️ Detected {activeAnomaliesCount} fuel efficiency anomaly across your fleet. Check tire pressure or air filter on affected vehicles.");
        }
        if (upcomingServicesCount > 0)
        {
            recommendations.Add($"🔧 {upcomingServicesCount} vehicle(s) are due or approaching maintenance service in the next 30 days.");
        }
        if (avgFleetCpk > 15.0)
        {
            recommendations.Add($"💡 Fleet Cost per Km is higher than average (₹{Math.Round(avgFleetCpk, 2)}/km). Consider optimizing route efficiency or checking fuel fill stations.");
        }
        if (recommendations.Count == 0)
        {
            recommendations.Add("✅ All fleet health metrics, fuel efficiency, and service schedules are operating at optimal levels.");
        }

        return new FleetSummaryAnalyticsDto(
            totalVehicles,
            Math.Round(totalFleetSpend, 2),
            Math.Round(avgFleetCpk, 2),
            Math.Round(avgFleetMileage, 2),
            activeAnomaliesCount,
            upcomingServicesCount,
            forecast30Days,
            forecast90Days,
            vehicleSummaries,
            recommendations
        );
    }
}
