using Microsoft.EntityFrameworkCore;
using Serilog;
using Vakifbankstajyer.Data;
using Vakifbankstajyer.Services;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting web application");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog
    builder.Host.UseSerilog();

    // Add services to the container.
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // CORS for Angular
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAngular",
            policy => policy.WithOrigins("http://localhost:4200")
                            .AllowAnyMethod()
                            .AllowAnyHeader());
    });

    // DbContext
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Register Custom Services
    builder.Services.AddScoped<CreditCalculationService>();
    builder.Services.AddScoped<RiskAnalysisService>();
    builder.Services.AddScoped<EmailService>();

    var app = builder.Build();

    // Initialize Database and Train ML Model on startup
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbContext.Database.EnsureCreated(); // Ensure DB is created
        
        // Ensure new table is created since EnsureCreated doesn't run on existing DBs
        dbContext.Database.ExecuteSqlRaw(@"
            IF EXISTS (SELECT * FROM sysobjects WHERE name='CreditApplications' and xtype='U')
            BEGIN
                DROP TABLE CreditApplications
            END

            CREATE TABLE CreditApplications (
                Id INT PRIMARY KEY IDENTITY,
                Email NVARCHAR(MAX),
                NameSurname NVARCHAR(MAX),
                BankName NVARCHAR(MAX),
                LoanType NVARCHAR(MAX),
                Amount DECIMAL(18,2) NOT NULL,
                LoanTerm INT NOT NULL,
                Status NVARCHAR(MAX) DEFAULT 'Beklemede',
                RiskStatus NVARCHAR(MAX) DEFAULT '',
                RiskScore REAL DEFAULT 0
            )

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
            BEGIN
                CREATE TABLE Users (
                    Id INT PRIMARY KEY IDENTITY,
                    Username NVARCHAR(50) NOT NULL,
                    Password NVARCHAR(MAX) NOT NULL,
                    Role NVARCHAR(20) DEFAULT 'Banka Yetkilisi',
                    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
                )
            END
        ");
        var riskService = scope.ServiceProvider.GetRequiredService<RiskAnalysisService>();
        try
        {
            riskService.TrainModel();
            Log.Information("ML Model trained successfully at startup.");
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Could not train ML Model at startup. Make sure german_credit_data.csv is in the correct directory.");
        }
    }

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // app.UseHttpsRedirection();

    app.UseCors("AllowAngular");

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
