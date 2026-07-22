namespace VehicleIQ.API.Models.Enums;

/// <summary>
/// Types of documents that can be uploaded.
/// Used for categorization and filtering in the document list.
/// </summary>
public enum DocumentType
{
    RC = 0,
    DrivingLicense = 1,
    Insurance = 2,
    PUC = 3,
    ServiceBill = 4,
    Other = 99
}
