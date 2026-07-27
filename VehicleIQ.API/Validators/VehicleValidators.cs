using FluentValidation;
using VehicleIQ.API.DTOs;

namespace VehicleIQ.API.Validators;

public class CreateVehicleRequestValidator : AbstractValidator<CreateVehicleRequest>
{
    public CreateVehicleRequestValidator()
    {
        RuleFor(x => x.Make)
            .NotEmpty().WithMessage("Vehicle make is required.")
            .MaximumLength(50).WithMessage("Make cannot exceed 50 characters.");

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Vehicle model is required.")
            .MaximumLength(50).WithMessage("Model cannot exceed 50 characters.");

        RuleFor(x => x.Year)
            .InclusiveBetween(1900, 2100).WithMessage("Year must be between 1900 and 2100.");

        RuleFor(x => x.RegistrationNumber)
            .NotEmpty().WithMessage("Registration number is required.")
            .MaximumLength(20).WithMessage("Registration number cannot exceed 20 characters.");

        RuleFor(x => x.CurrentOdometer)
            .GreaterThanOrEqualTo(0).WithMessage("Odometer reading must be non-negative.");
    }
}

public class UpdateVehicleRequestValidator : AbstractValidator<UpdateVehicleRequest>
{
    public UpdateVehicleRequestValidator()
    {
        RuleFor(x => x.Make)
            .NotEmpty().WithMessage("Vehicle make is required.")
            .MaximumLength(50).WithMessage("Make cannot exceed 50 characters.");

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Vehicle model is required.")
            .MaximumLength(50).WithMessage("Model cannot exceed 50 characters.");

        RuleFor(x => x.Year)
            .InclusiveBetween(1900, 2100).WithMessage("Year must be between 1900 and 2100.");

        RuleFor(x => x.RegistrationNumber)
            .NotEmpty().WithMessage("Registration number is required.")
            .MaximumLength(20).WithMessage("Registration number cannot exceed 20 characters.");

        RuleFor(x => x.CurrentOdometer)
            .GreaterThanOrEqualTo(0).WithMessage("Odometer reading must be non-negative.");
    }
}
