using Interview.Application.Commands.RescheduleInterview;
using Interview.Application.Commands.ScheduleInterview;
using Interview.Application.Commands.SubmitEvaluation;
using Interview.Infrastructure;
using Notification.Application.Interfaces;
using Notification.Infrastructure.Services;
using Notification.Infrastructure.Settings;
using Interview.Application.Services;
using Interview.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInterviewInfrastructure(builder.Configuration);
builder.Services.AddScoped<ScheduleInterviewCommandHandler>();
builder.Services.AddScoped<RescheduleInterviewCommandHandler>();
builder.Services.AddScoped<SubmitEvaluationCommandHandler>();
builder.Services.AddControllers();
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddSingleton(sp =>
{
    var settings = new EmailSettings();
    builder.Configuration.GetSection("EmailSettings").Bind(settings);
    return settings;
});

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");
app.MapControllers();
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
