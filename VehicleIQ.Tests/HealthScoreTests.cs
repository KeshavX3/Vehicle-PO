using Xunit;

namespace VehicleIQ.Tests;

public class HealthScoreTests
{
    private static int CalculateHealthScore(int? insuranceDaysLeft, int? pucDaysLeft, int overdueRemindersCount = 0, int fuelAnomaliesCount = 0)
    {
        int score = 100;

        if (insuranceDaysLeft.HasValue)
        {
            if (insuranceDaysLeft.Value < 0) score -= 25;
            else if (insuranceDaysLeft.Value <= 7) score -= 15;
            else if (insuranceDaysLeft.Value <= 30) score -= 5;
        }
        else
        {
            score -= 15;
        }

        if (pucDaysLeft.HasValue)
        {
            if (pucDaysLeft.Value < 0) score -= 20;
            else if (pucDaysLeft.Value <= 7) score -= 10;
            else if (pucDaysLeft.Value <= 15) score -= 5;
        }
        else
        {
            score -= 10;
        }

        score -= (overdueRemindersCount * 10);
        score -= (fuelAnomaliesCount * 15);

        return Math.Max(0, score);
    }

    [Fact]
    public void CalculateHealthScore_OptimalVehicle_Returns100()
    {
        // Arrange & Act
        int score = CalculateHealthScore(insuranceDaysLeft: 120, pucDaysLeft: 90);

        // Assert
        Assert.Equal(100, score);
    }

    [Fact]
    public void CalculateHealthScore_ExpiredInsuranceAndPuc_DeductsCorrectly()
    {
        // Arrange & Act
        int score = CalculateHealthScore(insuranceDaysLeft: -5, pucDaysLeft: -2);

        // Assert: 100 - 25 - 20 = 55
        Assert.Equal(55, score);
    }

    [Fact]
    public void CalculateHealthScore_MultipleAnomalies_FloorsAtZero()
    {
        // Arrange & Act
        int score = CalculateHealthScore(insuranceDaysLeft: -10, pucDaysLeft: -10, overdueRemindersCount: 5, fuelAnomaliesCount: 3);

        // Assert: Score cannot drop below 0
        Assert.Equal(0, score);
    }
}
