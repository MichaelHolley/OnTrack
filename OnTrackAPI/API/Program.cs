using API.Models;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
BsonSerializer.RegisterSerializer(new GuidSerializer(MongoDB.Bson.BsonType.String));

builder.Services.Configure<OnTrackDatabaseSettings>(
	builder.Configuration.GetSection("OnTrackDatabase"));

builder.Services.AddSingleton<IActivityService, ActivityService>();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.MapGet("/api/activities", ([FromServices] IActivityService activityService) =>
{
	return Results.Ok(activityService.GetActivities());
});

app.MapGet("/api/activities/{id}", ([FromServices] IActivityService activityService, Guid id) =>
{
	return Results.Ok(activityService.GetActivityById(id));
});

app.MapPost("/api/activities/create", ([FromServices] IActivityService activityService, Activity activity) =>
{
	return Results.Ok(activityService.Create(activity));
});

app.MapPut("/api/activities/{id}/addvalue", ([FromServices] IActivityService activityService, Guid id, ActivityValue value) =>
{
	return Results.Ok(activityService.AddValue(id, value));
});

app.MapPut("/api/activities/{id}/update", ([FromServices] IActivityService activityService, Activity activity) =>
{
	return Results.Ok(activityService.Update(activity));
});

app.MapDelete("/api/activities/{id}/delete", ([FromServices] IActivityService activityService, Guid id) =>
{
	activityService.Delete(id);
	return Results.Ok();
});

app.Run();