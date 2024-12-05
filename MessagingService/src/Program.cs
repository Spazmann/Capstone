using MessagingService.Services;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Register MongoDbService
builder.Services.AddSingleton<MongoDbService>();

// Add controllers for API endpoints
builder.Services.AddControllers();

var app = builder.Build();

// Map controllers to endpoints
app.MapControllers();

app.Run();
