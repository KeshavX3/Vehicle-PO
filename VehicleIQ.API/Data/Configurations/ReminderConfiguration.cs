using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VehicleIQ.API.Models.Entities;

namespace VehicleIQ.API.Data.Configurations;

public class ReminderConfiguration : IEntityTypeConfiguration<Reminder>
{
    public void Configure(EntityTypeBuilder<Reminder> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .HasMaxLength(500);

        builder.Property(r => r.Status)
            .HasDefaultValue(Models.Enums.ReminderStatus.Pending);

        builder.Property(r => r.ReferenceType)
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(r => r.User)
            .WithMany(u => u.Reminders)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Vehicle)
            .WithMany(v => v.Reminders)
            .HasForeignKey(r => r.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(r => new { r.UserId, r.Status })
            .HasDatabaseName("IX_Reminders_UserId_Status");

        builder.HasIndex(r => r.DueDate)
            .HasDatabaseName("IX_Reminders_DueDate");
    }
}
