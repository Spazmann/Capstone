using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using MessagingBackend.Services;
using MessagingBackend;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<MongoDbService>();

builder.Services.AddSignalR().AddAzureSignalR(builder.Configuration["Azure:SignalR:ConnectionString"]);

builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();

    endpoints.MapHub<ChatHub>("/chatHub");
});

app.Run();
