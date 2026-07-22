using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Data.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.HasKey(v => v.Id);

        builder.Property(v => v.Make)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(v => v.Model)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(v => v.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(v => v.Color)
            .HasMaxLength(30);

        builder.Property(v => v.CurrentOdometer)
            .HasColumnType("decimal(12,1)")
            .HasDefaultValue(0m);

        builder.Property(v => v.PhotoUrl)
            .HasMaxLength(500);

        builder.Property(v => v.IsDeleted)
            .HasDefaultValue(false);

        // Global query filter — automatically excludes soft-deleted vehicles
        builder.HasQueryFilter(v => !v.IsDeleted);

        // Relationships
        builder.HasOne(v => v.User)
            .WithMany(u => u.Vehicles)
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(v => v.UserId)
            .HasDatabaseName("IX_Vehicles_UserId");

        builder.HasIndex(v => new { v.UserId, v.IsDeleted })
            .HasDatabaseName("IX_Vehicles_UserId_IsDeleted");
    }
}
