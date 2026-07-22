using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Data.Configurations;

public class FuelEntryConfiguration : IEntityTypeConfiguration<FuelEntry>
{
    public void Configure(EntityTypeBuilder<FuelEntry> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Quantity)
            .HasColumnType("decimal(10,2)");

        builder.Property(f => f.PricePerLiter)
            .HasColumnType("decimal(10,2)");

        builder.Property(f => f.TotalCost)
            .HasColumnType("decimal(12,2)");

        builder.Property(f => f.OdometerReading)
            .HasColumnType("decimal(12,1)");

        builder.Property(f => f.IsFullTank)
            .HasDefaultValue(true);

        builder.Property(f => f.FuelStationName)
            .HasMaxLength(100);

        builder.Property(f => f.Notes)
            .HasMaxLength(500);

        builder.Property(f => f.CalculatedMileage)
            .HasColumnType("decimal(6,2)");

        // Relationships
        builder.HasOne(f => f.Vehicle)
            .WithMany(v => v.FuelEntries)
            .HasForeignKey(f => f.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(f => f.VehicleId)
            .HasDatabaseName("IX_FuelEntries_VehicleId");

        builder.HasIndex(f => new { f.VehicleId, f.Date })
            .HasDatabaseName("IX_FuelEntries_VehicleId_Date");
    }
}
