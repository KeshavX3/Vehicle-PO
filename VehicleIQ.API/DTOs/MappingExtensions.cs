using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.DTOs;

/// <summary>
/// Static extension class containing manual mapping functions.
/// Manual mapping provides compile-time safety and optimal performance.
/// </summary>
public static class MappingExtensions
{
    // User Mapping
    public static UserDto ToDto(this User user)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.AvatarUrl,
            user.IsActive
        );
    }

    // Vehicle Mapping
    public static VehicleDto ToDto(this Vehicle vehicle)
    {
        return new VehicleDto(
            vehicle.Id,
            vehicle.UserId,
            vehicle.Make,
            vehicle.Model,
            vehicle.Year,
            vehicle.RegistrationNumber,
            vehicle.VehicleType,
            vehicle.FuelType,
            vehicle.Color,
            vehicle.CurrentOdometer,
            vehicle.PhotoUrl
        );
    }

    public static Vehicle ToEntity(this CreateVehicleRequest request, int userId)
    {
        return new Vehicle
        {
            UserId = userId,
            Make = request.Make,
            Model = request.Model,
            Year = request.Year,
            RegistrationNumber = request.RegistrationNumber,
            VehicleType = request.VehicleType,
            FuelType = request.FuelType,
            Color = request.Color,
            CurrentOdometer = request.CurrentOdometer,
            PhotoUrl = request.PhotoUrl,
            IsDeleted = false
        };
    }

    public static void UpdateEntity(this UpdateVehicleRequest request, Vehicle vehicle)
    {
        vehicle.Make = request.Make;
        vehicle.Model = request.Model;
        vehicle.Year = request.Year;
        vehicle.RegistrationNumber = request.RegistrationNumber;
        vehicle.VehicleType = request.VehicleType;
        vehicle.FuelType = request.FuelType;
        vehicle.Color = request.Color;
        vehicle.PhotoUrl = request.PhotoUrl;
        vehicle.CurrentOdometer = request.CurrentOdometer;
    }

    // FuelEntry Mapping
    public static FuelEntryDto ToDto(this FuelEntry entry)
    {
        return new FuelEntryDto(
            entry.Id,
            entry.VehicleId,
            entry.Date,
            entry.FuelType,
            entry.Quantity,
            entry.PricePerLiter,
            entry.TotalCost,
            entry.OdometerReading,
            entry.IsFullTank,
            entry.FuelStationName,
            entry.Notes,
            entry.CalculatedMileage
        );
    }

    public static FuelEntry ToEntity(this CreateFuelEntryRequest request)
    {
        return new FuelEntry
        {
            VehicleId = request.VehicleId,
            Date = request.Date,
            FuelType = request.FuelType,
            Quantity = request.Quantity,
            PricePerLiter = request.PricePerLiter,
            TotalCost = request.Quantity * request.PricePerLiter, // Auto-calculate total cost
            OdometerReading = request.OdometerReading,
            IsFullTank = request.IsFullTank,
            FuelStationName = request.FuelStationName,
            Notes = request.Notes
        };
    }

    // ServiceRecord Mapping
    public static ServiceRecordDto ToDto(this ServiceRecord record)
    {
        return new ServiceRecordDto(
            record.Id,
            record.VehicleId,
            record.Date,
            record.ServiceType,
            record.Description,
            record.Cost,
            record.OdometerReading,
            record.GarageName,
            record.NextServiceDate,
            record.NextServiceOdometer,
            record.Notes
        );
    }

    public static ServiceRecord ToEntity(this CreateServiceRecordRequest request)
    {
        return new ServiceRecord
        {
            VehicleId = request.VehicleId,
            Date = request.Date,
            ServiceType = request.ServiceType,
            Description = request.Description,
            Cost = request.Cost,
            OdometerReading = request.OdometerReading,
            GarageName = request.GarageName,
            NextServiceDate = request.NextServiceDate,
            NextServiceOdometer = request.NextServiceOdometer,
            Notes = request.Notes
        };
    }

    // Expense Mapping
    public static ExpenseDto ToDto(this Expense expense)
    {
        return new ExpenseDto(
            expense.Id,
            expense.UserId,
            expense.VehicleId,
            expense.Date,
            expense.Category,
            expense.Amount,
            expense.Description,
            expense.ReferenceType,
            expense.ReferenceId
        );
    }

    public static Expense ToEntity(this CreateExpenseRequest request, int userId)
    {
        return new Expense
        {
            UserId = userId,
            VehicleId = request.VehicleId,
            Date = request.Date,
            Category = request.Category,
            Amount = request.Amount,
            Description = request.Description
        };
    }

    // Insurance Mapping
    public static InsuranceDto ToDto(this Insurance insurance)
    {
        return new InsuranceDto(
            insurance.Id,
            insurance.VehicleId,
            insurance.Provider,
            insurance.PolicyNumber,
            insurance.CoverageType,
            insurance.StartDate,
            insurance.EndDate,
            insurance.PremiumAmount,
            insurance.Notes
        );
    }

    public static Insurance ToEntity(this CreateInsuranceRequest request)
    {
        return new Insurance
        {
            VehicleId = request.VehicleId,
            Provider = request.Provider,
            PolicyNumber = request.PolicyNumber,
            CoverageType = request.CoverageType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            PremiumAmount = request.PremiumAmount,
            Notes = request.Notes
        };
    }

    // PucCertificate Mapping
    public static PucCertificateDto ToDto(this PucCertificate puc)
    {
        return new PucCertificateDto(
            puc.Id,
            puc.VehicleId,
            puc.Date,
            puc.ExpiryDate,
            puc.CertificateNumber,
            puc.EmissionLevel,
            puc.Notes
        );
    }

    public static PucCertificate ToEntity(this CreatePucCertificateRequest request)
    {
        return new PucCertificate
        {
            VehicleId = request.VehicleId,
            Date = request.Date,
            ExpiryDate = request.ExpiryDate,
            CertificateNumber = request.CertificateNumber,
            EmissionLevel = request.EmissionLevel,
            Notes = request.Notes
        };
    }

    // Reminder Mapping
    public static ReminderDto ToDto(this Reminder reminder)
    {
        return new ReminderDto(
            reminder.Id,
            reminder.UserId,
            reminder.VehicleId,
            reminder.Title,
            reminder.Description,
            reminder.DueDate,
            reminder.ReminderType,
            reminder.Status,
            reminder.SnoozedUntil,
            reminder.ReferenceType,
            reminder.ReferenceId
        );
    }

    public static Reminder ToEntity(this CreateReminderRequest request, int userId)
    {
        return new Reminder
        {
            UserId = userId,
            VehicleId = request.VehicleId,
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            ReminderType = request.ReminderType,
            Status = Models.Enums.ReminderStatus.Pending
        };
    }

    // Document Mapping
    public static DocumentDto ToDto(this Document doc)
    {
        return new DocumentDto(
            doc.Id,
            doc.UserId,
            doc.VehicleId,
            doc.DocumentType,
            doc.FileName,
            doc.OriginalFileName,
            doc.FilePath,
            doc.ContentType,
            doc.FileSizeBytes,
            doc.ReferenceType,
            doc.ReferenceId,
            doc.CreatedAt
        );
    }
}
