using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using VehicleIQ.API.Data;
using VehicleIQ.API.Middleware;
using VehicleIQ.API.Repositories.Interfaces;
using VehicleIQ.API.Repositories.Implementations;
using VehicleIQ.API.Services.Interfaces;
using VehicleIQ.API.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────
// 1. Register Services (Dependency Injection)
// ──────────────────────────────────────────────

// Database — Entity Framework Core with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            // Retry on transient failures (network blips, SQL Server restarts)
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
        }));

// ─── Repositories ───
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IFuelEntryRepository, FuelEntryRepository>();
builder.Services.AddScoped<IServiceRecordRepository, ServiceRecordRepository>();
builder.Services.AddScoped<IExpenseRepository, ExpenseRepository>();
builder.Services.AddScoped<IInsuranceRepository, InsuranceRepository>();
builder.Services.AddScoped<IPucCertificateRepository, PucCertificateRepository>();
builder.Services.AddScoped<IReminderRepository, ReminderRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();

// ─── Services ───
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IFuelEntryService, FuelEntryService>();
builder.Services.AddScoped<IServiceRecordService, ServiceRecordService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IInsuranceService, InsuranceService>();
builder.Services.AddScoped<IPucCertificateService, PucCertificateService>();
builder.Services.AddScoped<IReminderService, ReminderService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();

// Controllers — we use controllers, not minimal APIs, for a clean architecture
builder.Services.AddControllers();

// Swagger — API documentation and testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — allow React frontend to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite default port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ──────────────────────────────────────────────
// 2. Build the Application
// ──────────────────────────────────────────────

var app = builder.Build();

// Global Exception Handler - must be first in pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

// ──────────────────────────────────────────────
// 3. Configure Middleware Pipeline
// ──────────────────────────────────────────────

// Swagger UI — available in development only
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "VehicleIQ API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// CORS must come before authentication and authorization
app.UseCors("AllowReactApp");

// Serve uploaded documents statically (e.g. photos/receipts)
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Authentication & Authorization (will be configured in Phase 5)
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
