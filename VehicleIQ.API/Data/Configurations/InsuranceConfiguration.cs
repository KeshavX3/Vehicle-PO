using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Data.Configurations;

public class InsuranceConfiguration : IEntityTypeConfiguration<Insurance>
{
    public void Configure(EntityTypeBuilder<Insurance> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Provider)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(i => i.PolicyNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.PremiumAmount)
            .HasColumnType("decimal(12,2)");

        builder.Property(i => i.Notes)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(i => i.Vehicle)
            .WithMany(v => v.Insurances)
            .HasForeignKey(i => i.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(i => i.VehicleId)
            .HasDatabaseName("IX_Insurances_VehicleId");

        builder.HasIndex(i => i.EndDate)
            .HasDatabaseName("IX_Insurances_EndDate");
    }
}
