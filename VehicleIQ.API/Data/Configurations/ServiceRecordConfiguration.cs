using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Data.Configurations;

public class ServiceRecordConfiguration : IEntityTypeConfiguration<ServiceRecord>
{
    public void Configure(EntityTypeBuilder<ServiceRecord> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Description)
            .HasMaxLength(500);

        builder.Property(s => s.Cost)
            .HasColumnType("decimal(12,2)");

        builder.Property(s => s.OdometerReading)
            .HasColumnType("decimal(12,1)");

        builder.Property(s => s.GarageName)
            .HasMaxLength(100);

        builder.Property(s => s.NextServiceOdometer)
            .HasColumnType("decimal(12,1)");

        builder.Property(s => s.Notes)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(s => s.Vehicle)
            .WithMany(v => v.ServiceRecords)
            .HasForeignKey(s => s.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(s => s.VehicleId)
            .HasDatabaseName("IX_ServiceRecords_VehicleId");

        builder.HasIndex(s => new { s.VehicleId, s.Date })
            .HasDatabaseName("IX_ServiceRecords_VehicleId_Date");
    }
}
