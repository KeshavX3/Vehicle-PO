using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Data.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Amount)
            .HasColumnType("decimal(12,2)");

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.ReferenceType)
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(e => e.User)
            .WithMany(u => u.Expenses)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Vehicle)
            .WithMany(v => v.Expenses)
            .HasForeignKey(e => e.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes — designed around actual query patterns
        builder.HasIndex(e => e.UserId)
            .HasDatabaseName("IX_Expenses_UserId");

        builder.HasIndex(e => e.VehicleId)
            .HasDatabaseName("IX_Expenses_VehicleId");

        builder.HasIndex(e => new { e.UserId, e.Date })
            .HasDatabaseName("IX_Expenses_UserId_Date");

        builder.HasIndex(e => new { e.UserId, e.Category })
            .HasDatabaseName("IX_Expenses_UserId_Category");
    }
}
