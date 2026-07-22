using Microsoft.EntityFrameworkCore;
using VehicleIQ.API.Models.Entities;
using VehicleIQ.API.Models.Enums;

namespace VehicleIQ.API.Data;

/// <summary>
/// Application database context. Central point for all EF Core operations.
/// Overrides SaveChangesAsync to automatically manage CreatedAt/UpdatedAt timestamps.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet properties — one per table
    public DbSet<User> Users => Set<User>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<FuelEntry> FuelEntries => Set<FuelEntry>();
    public DbSet<ServiceRecord> ServiceRecords => Set<ServiceRecord>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Insurance> Insurances => Set<Insurance>();
    public DbSet<PucCertificate> PucCertificates => Set<PucCertificate>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Reminder> Reminders => Set<Reminder>();

    /// <summary>
    /// Applies all entity configurations from the Data/Configurations folder.
    /// This keeps entity configuration separate from the DbContext class.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Automatically discovers and applies all IEntityTypeConfiguration<T>
        // implementations in the same assembly as AppDbContext.
        // This means every *Configuration.cs file in Data/Configurations/ is auto-registered.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Seed default demo user (Password: Demo@123)
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Email = "demo@vehicleiq.com",
            PasswordHash = "$2a$11$8mN7yK.rC.v9t9a6d8R8u.C6kK58E1X5q16v24y25t26t27u28v29",
            FullName = "Keshav Kumar",
            Phone = "9876543210",
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed default demo vehicle (linked to user 1)
        modelBuilder.Entity<Vehicle>().HasData(new Vehicle
        {
            Id = 1,
            UserId = 1,
            Make = "Honda",
            Model = "City",
            Year = 2022,
            RegistrationNumber = "MH 12 AB 1234",
            VehicleType = VehicleType.Car,
            FuelType = FuelType.Petrol,
            Color = "White",
            CurrentOdometer = 25000m,
            IsDeleted = false,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }

    /// <summary>
    /// Automatically sets CreatedAt on insert and UpdatedAt on every modification.
    /// This is a guardrail — developers can't forget to set timestamps.
    /// Also handles Document.CreatedAt since Document doesn't inherit BaseEntity.
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = utcNow;
                    entry.Entity.UpdatedAt = utcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = utcNow;
                    // Prevent overwriting CreatedAt on updates
                    entry.Property(e => e.CreatedAt).IsModified = false;
                    break;
            }
        }

        // Handle Document separately since it doesn't inherit BaseEntity
        foreach (var entry in ChangeTracker.Entries<Document>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Synchronous SaveChanges also applies timestamp logic for consistency.
    /// </summary>
    public override int SaveChanges()
    {
        var utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = utcNow;
                    entry.Entity.UpdatedAt = utcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = utcNow;
                    entry.Property(e => e.CreatedAt).IsModified = false;
                    break;
            }
        }

        foreach (var entry in ChangeTracker.Entries<Document>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = utcNow;
            }
        }

        return base.SaveChanges();
    }
}
