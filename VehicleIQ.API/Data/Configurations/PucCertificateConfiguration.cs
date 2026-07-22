using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Data.Configurations;

public class PucCertificateConfiguration : IEntityTypeConfiguration<PucCertificate>
{
    public void Configure(EntityTypeBuilder<PucCertificate> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.CertificateNumber)
            .HasMaxLength(50);

        builder.Property(p => p.EmissionLevel)
            .HasMaxLength(50);

        builder.Property(p => p.Notes)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(p => p.Vehicle)
            .WithMany(v => v.PucCertificates)
            .HasForeignKey(p => p.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(p => p.VehicleId)
            .HasDatabaseName("IX_PucCertificates_VehicleId");

        builder.HasIndex(p => p.ExpiryDate)
            .HasDatabaseName("IX_PucCertificates_ExpiryDate");
    }
}
