using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Data;

public static class DataSeeder
{
    public static async Task SeedComprehensiveFleetDataAsync(AppDbContext context)
    {
        if (await context.Vehicles.IgnoreQueryFilters().CountAsync() >= 15)
        {
            return;
        }

        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == "engineer@vehicleiq.com");
        if (user == null)
        {
            user = new User
            {
                Email = "engineer@vehicleiq.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                FullName = "Demo Engineer",
                Phone = "9876543210",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
        }

        int userId = user.Id;

        var vehicleData = new[]
        {
            new { Make = "Toyota", Model = "Fortuner Legender", Year = 2023, Reg = "MH 12 FE 9999", Type = VehicleType.SUV, Fuel = FuelType.Diesel, Color = "Pearl White", Odo = 38500m },
            new { Make = "Honda", Model = "City e:HEV", Year = 2022, Reg = "MH 14 AB 1234", Type = VehicleType.Car, Fuel = FuelType.Hybrid, Color = "Radiant Red", Odo = 28400m },
            new { Make = "Hyundai", Model = "Creta SX(O)", Year = 2023, Reg = "DL 01 CA 5678", Type = VehicleType.SUV, Fuel = FuelType.Petrol, Color = "Titan Grey", Odo = 19200m },
            new { Make = "Mahindra", Model = "Thar 4x4", Year = 2022, Reg = "KA 05 M 4040", Type = VehicleType.SUV, Fuel = FuelType.Diesel, Color = "Napoli Black", Odo = 31000m },
            new { Make = "BMW", Model = "M4 Competition", Year = 2023, Reg = "MH 02 CZ 0007", Type = VehicleType.Car, Fuel = FuelType.Petrol, Color = "Isle of Man Green", Odo = 12500m },
            new { Make = "Tata", Model = "Nexon EV Max", Year = 2023, Reg = "MH 12 EV 2023", Type = VehicleType.SUV, Fuel = FuelType.Electric, Color = "Teal Blue", Odo = 22000m },
            new { Make = "Kia", Model = "Seltos GTX+", Year = 2022, Reg = "HR 26 DQ 8888", Type = VehicleType.SUV, Fuel = FuelType.Petrol, Color = "Gravity Grey", Odo = 35600m },
            new { Make = "Maruti Suzuki", Model = "Swift ZXi+", Year = 2021, Reg = "MH 12 DF 4321", Type = VehicleType.Car, Fuel = FuelType.Petrol, Color = "Sizzling Red", Odo = 48000m },
            new { Make = "Mercedes-Benz", Model = "C 300d", Year = 2023, Reg = "MH 01 EQ 1111", Type = VehicleType.Car, Fuel = FuelType.Diesel, Color = "Obsidian Black", Odo = 16400m },
            new { Make = "Audi", Model = "A4 Technology", Year = 2022, Reg = "DL 03 CC 9000", Type = VehicleType.Car, Fuel = FuelType.Petrol, Color = "Ibis White", Odo = 27800m },
            new { Make = "Volkswagen", Model = "Virtus GT 1.5", Year = 2023, Reg = "MH 12 VW 7777", Type = VehicleType.Car, Fuel = FuelType.Petrol, Color = "Wild Cherry Red", Odo = 15300m },
            new { Make = "Skoda", Model = "Octavia vRS", Year = 2021, Reg = "MH 14 SK 5555", Type = VehicleType.Car, Fuel = FuelType.Petrol, Color = "Race Blue", Odo = 41200m },
            new { Make = "MG", Model = "Hector Plus", Year = 2022, Reg = "KA 01 MG 2022", Type = VehicleType.SUV, Fuel = FuelType.Diesel, Color = "Aurora Silver", Odo = 33000m },
            new { Make = "Mahindra", Model = "XUV700 AX7L", Year = 2023, Reg = "MH 12 XV 7000", Type = VehicleType.SUV, Fuel = FuelType.Diesel, Color = "Midnight Black", Odo = 24500m },
            new { Make = "Royal Enfield", Model = "Classic 350", Year = 2022, Reg = "MH 12 RE 3500", Type = VehicleType.Bike, Fuel = FuelType.Petrol, Color = "Halcyon Green", Odo = 14200m },
            new { Make = "Bajaj", Model = "Chetak Premium", Year = 2023, Reg = "MH 12 EV 1001", Type = VehicleType.Scooter, Fuel = FuelType.Electric, Color = "Hazelnut", Odo = 8900m },
            new { Make = "Volvo", Model = "XC90 Recharge", Year = 2023, Reg = "KA 03 VO 9999", Type = VehicleType.SUV, Fuel = FuelType.Hybrid, Color = "Crystal White", Odo = 18700m },
            new { Make = "Porsche", Model = "911 Carrera S", Year = 2023, Reg = "MH 02 GT 9110", Type = VehicleType.Car, Fuel = FuelType.Petrol, Color = "Guards Red", Odo = 9400m },
            new { Make = "Lexus", Model = "RX 500h F-Sport", Year = 2023, Reg = "DL 01 LX 5000", Type = VehicleType.SUV, Fuel = FuelType.Hybrid, Color = "Sonic Copper", Odo = 14800m },
            new { Make = "Ford", Model = "Endeavour 3.2", Year = 2020, Reg = "MH 12 FD 3200", Type = VehicleType.SUV, Fuel = FuelType.Diesel, Color = "Absolute Black", Odo = 72000m }
        };

        var random = new Random(42);
        var now = DateTime.UtcNow;

        foreach (var vSpec in vehicleData)
        {
            var vehicle = new Vehicle
            {
                UserId = userId,
                Make = vSpec.Make,
                Model = vSpec.Model,
                Year = vSpec.Year,
                RegistrationNumber = vSpec.Reg,
                VehicleType = vSpec.Type,
                FuelType = vSpec.Fuel,
                Color = vSpec.Color,
                CurrentOdometer = vSpec.Odo,
                IsDeleted = false,
                CreatedAt = now.AddMonths(-12)
            };
            context.Vehicles.Add(vehicle);
            await context.SaveChangesAsync();

            decimal currentOdo = vSpec.Odo - 3000m;
            double targetBaselineKmL = vSpec.Fuel switch
            {
                FuelType.Hybrid => 22.5,
                FuelType.Diesel => 15.5,
                FuelType.Petrol => 13.2,
                FuelType.CNG => 24.0,
                _ => 14.0
            };

            for (int i = 5; i >= 0; i--)
            {
                decimal fuelQty = (decimal)(35 + random.Next(5, 20));
                decimal fuelPrice = vSpec.Fuel == FuelType.Diesel ? 92.5m : 104.2m;

                bool isAnomalyEntry = (i == 2 && (vSpec.Make == "Honda" || vSpec.Make == "Toyota" || vSpec.Make == "Maruti Suzuki"));
                double actualMileage = isAnomalyEntry ? targetBaselineKmL * 0.72 : targetBaselineKmL + (random.NextDouble() * 1.5 - 0.75);

                decimal odoDelta = (decimal)(actualMileage * (double)fuelQty);
                currentOdo += odoDelta;

                var fuelEntry = new FuelEntry
                {
                    VehicleId = vehicle.Id,
                    Date = now.AddDays(-i * 15 - 5),
                    FuelType = vSpec.Fuel,
                    Quantity = fuelQty,
                    PricePerLiter = fuelPrice,
                    TotalCost = fuelQty * fuelPrice,
                    OdometerReading = currentOdo,
                    IsFullTank = true,
                    FuelStationName = random.Next(2) == 0 ? "HP Fuel Station" : "BPCL Mega Outlet",
                    CalculatedMileage = (decimal)actualMileage,
                    CreatedAt = now.AddDays(-i * 15 - 5)
                };
                context.FuelEntries.Add(fuelEntry);
            }

            vehicle.CurrentOdometer = currentOdo;

            var serviceRecord = new ServiceRecord
            {
                VehicleId = vehicle.Id,
                Date = now.AddMonths(-4),
                ServiceType = ServiceType.GeneralService,
                Description = "Scheduled periodic service & synthetic oil replace",
                Cost = random.Next(3500, 18000),
                OdometerReading = currentOdo - 4500m,
                GarageName = $"{vSpec.Make} Authorized Service Center",
                NextServiceDate = now.AddDays(random.Next(15, 60)),
                NextServiceOdometer = currentOdo + 3500m,
                CreatedAt = now.AddMonths(-4)
            };
            context.ServiceRecords.Add(serviceRecord);

            context.Expenses.Add(new Expense
            {
                UserId = userId,
                VehicleId = vehicle.Id,
                Date = now.AddDays(-10),
                Category = ExpenseCategory.Fuel,
                Amount = random.Next(3000, 5500),
                Description = "Full tank refuel",
                CreatedAt = now.AddDays(-10)
            });

            context.Expenses.Add(new Expense
            {
                UserId = userId,
                VehicleId = vehicle.Id,
                Date = now.AddDays(-40),
                Category = ExpenseCategory.Service,
                Amount = serviceRecord.Cost,
                Description = "General periodic service",
                CreatedAt = now.AddDays(-40)
            });

            context.Expenses.Add(new Expense
            {
                UserId = userId,
                VehicleId = vehicle.Id,
                Date = now.AddDays(-25),
                Category = ExpenseCategory.Toll,
                Amount = random.Next(250, 600),
                Description = "FASTag highway toll deduction",
                CreatedAt = now.AddDays(-25)
            });

            context.Insurances.Add(new Insurance
            {
                VehicleId = vehicle.Id,
                Provider = random.Next(2) == 0 ? "HDFC ERGO General Insurance" : "ICICI Lombard",
                PolicyNumber = $"POL-{random.Next(100000, 999999)}",
                CoverageType = InsuranceCoverageType.Comprehensive,
                StartDate = now.AddMonths(-6),
                EndDate = now.AddDays(random.Next(-10, 120)),
                PremiumAmount = random.Next(12000, 45000),
                CreatedAt = now.AddMonths(-6)
            });

            context.PucCertificates.Add(new PucCertificate
            {
                VehicleId = vehicle.Id,
                Date = now.AddMonths(-5),
                ExpiryDate = now.AddDays(random.Next(5, 90)),
                CertificateNumber = $"PUC-{random.Next(100000, 999999)}",
                EmissionLevel = "BS-VI Compliant (Pass)",
                CreatedAt = now.AddMonths(-5)
            });

            context.Reminders.Add(new Reminder
            {
                UserId = userId,
                VehicleId = vehicle.Id,
                Title = $"Annual Insurance Renewal - {vSpec.Make} {vSpec.Model}",
                Description = "Review policy options and pay renewal premium.",
                DueDate = now.AddDays(random.Next(5, 30)),
                ReminderType = ReminderType.InsuranceExpiry,
                Status = ReminderStatus.Pending,
                CreatedAt = now
            });
        }

        await context.SaveChangesAsync();
    }
}
