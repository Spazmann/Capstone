using Amazon.Lambda.AspNetCoreServer;
using MessagingBackend.Services;
using MessagingBackend.Models;
using MessagingBackend;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<MongoDbService>();
builder.Services.AddSignalR(); 

var app = builder.Build();

app.MapHub<ChatHub>("/chatHub");

if (app.Environment.IsDevelopment())
{
    app.UseRouting();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapHub<ChatHub>("/chatHub");
    });
}

app.Run();

public class LambdaEntryPoint : APIGatewayProxyFunction
{
    protected override void Init(IWebHostBuilder builder)
    {
        builder.ConfigureServices((context, services) =>
        {
            services.AddSingleton<MongoDbService>();
            services.AddSignalR();
        });

        builder.Configure(app =>
        {
            var env = app.ApplicationServices.GetService<IHostEnvironment>();
            if (env.IsDevelopment())
            {
                app.UseRouting();
                app.UseEndpoints(endpoints =>
                {
                    endpoints.MapHub<ChatHub>("/chatHub");
                });
            }
        });
    }
}
