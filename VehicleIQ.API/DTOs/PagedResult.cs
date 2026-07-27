namespace VehicleIQ.API.DTOs;

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
)
{
    public static PagedResult<T> Create(IReadOnlyList<T> items, int totalCount, int pageNumber, int pageSize)
    {
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        return new PagedResult<T>(items, totalCount, pageNumber, pageSize, totalPages);
    }
}
