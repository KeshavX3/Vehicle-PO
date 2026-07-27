using FluentValidation;
using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Validators;

public class CreateFuelEntryRequestValidator : AbstractValidator<CreateFuelEntryRequest>
{
    public CreateFuelEntryRequestValidator()
    {
        RuleFor(x => x.VehicleId)
            .GreaterThan(0).WithMessage("Valid vehicle ID is required.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Fuel quantity must be greater than zero.");

        RuleFor(x => x.PricePerLiter)
            .GreaterThan(0).WithMessage("Price per liter must be greater than zero.");

        RuleFor(x => x.OdometerReading)
            .GreaterThanOrEqualTo(0).WithMessage("Odometer reading must be non-negative.");
    }
}
