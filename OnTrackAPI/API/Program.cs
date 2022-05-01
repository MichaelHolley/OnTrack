using API.Models;
using API.Models.Activity;
using API.Models.Todo;
using API.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
BsonSerializer.RegisterSerializer(new GuidSerializer(MongoDB.Bson.BsonType.String));

builder.Services.Configure<OnTrackDatabaseSettings>(builder.Configuration.GetSection("OnTrackDatabase"));

builder.Services.AddCors();

builder.Services.AddAuthentication(x =>
	{
		x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
		x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
	})
	.AddJwtBearer(cfg =>
	{
		cfg.RequireHttpsMetadata = false;
		cfg.SaveToken = true;

		cfg.TokenValidationParameters = new TokenValidationParameters()
		{
			ValidateAudience = false,
			ValidateIssuer = true,
			ValidIssuer = builder.Configuration["Auth:ValidIssuer"],
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Auth:JwtSecret"])),
			ValidateLifetime = true
		};
	});

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IActivityService, ActivityService>();
builder.Services.AddSingleton<ITodoService, TodoService>();
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

/// <summary>
/// Login using Google-Token
/// </summary>
app.MapPost("/google-signin", ([FromServices] IAuthService authService, [FromServices] IUserService userService, UserView userView) =>
{
	try
	{
		var payload = GoogleJsonWebSignature.ValidateAsync(userView.TokenId, new GoogleJsonWebSignature.ValidationSettings()).Result;
		var user = authService.Authenticate(payload);

		var token = authService.GenerateAccessToken(builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"], user);
		var refreshToken = authService.GenerateRefreshToken();

		userService.UpdateUserRefreshToken(user.Id, refreshToken);

		return Results.Ok(new
		{
			Token = new JwtSecurityTokenHandler().WriteToken(token),
			RefreshToken = refreshToken
		});
	}
	catch (Exception ex)
	{
		return Results.BadRequest(ex.Message);
	}
}).AllowAnonymous();


/// <summary>
/// Refresh OnTrackAPI-Token - requiring previous API-Token + Refresh-Token
/// </summary>
app.MapPost("/refresh-token", ([FromServices] IAuthService authService, [FromServices] IUserService userService, HttpContext httpContext, UserView userView) =>
{
	try
	{
		var principal = authService.GetPrincipalFromExpiredToken(userView.TokenId, builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"]);

		var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
		var user = userService.GetUserById(Guid.Parse(userId));

		if (userView.TokenId == null || user == null || user.RefreshToken != userView.RefreshToken)
		{
			return Results.BadRequest("Invalid client-request");
		}

		var newAccessToken = authService.GenerateAccessToken(builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"], user);
		var newRefreshToken = authService.GenerateRefreshToken();

		userService.UpdateUserRefreshToken(user.Id, newRefreshToken);

		return Results.Ok(new
		{
			Token = new JwtSecurityTokenHandler().WriteToken(newAccessToken),
			RefreshToken = newRefreshToken
		});
	}
	catch (Exception ex)
	{
		return Results.BadRequest(ex.Message);
	}
}).AllowAnonymous();

app.MapGet("/api/activities", ([FromServices] IActivityService activityService) =>
{
	return Results.Ok(activityService.GetActivities());
}).RequireAuthorization();

app.MapGet("/api/activities/{id}", ([FromServices] IActivityService activityService, Guid id) =>
{
	return Results.Ok(activityService.GetActivityById(id));
}).RequireAuthorization();

app.MapPost("/api/activities/create", ([FromServices] IActivityService activityService, Activity activity) =>
{
	return Results.Created($"/api/activities/{activity.Id}", activityService.Create(activity));
}).RequireAuthorization();

app.MapPut("/api/activities/{id}/addvalue", ([FromServices] IActivityService activityService, Guid id, ActivityValue value) =>
{
	return Results.Ok(activityService.AddValue(id, value));
}).RequireAuthorization();

app.MapPut("/api/activities/{id}/update", ([FromServices] IActivityService activityService, Activity activity) =>
{
	return Results.Ok(activityService.Update(activity));
}).RequireAuthorization();

app.MapDelete("/api/activities/{id}/delete", ([FromServices] IActivityService activityService, Guid id) =>
{
	activityService.Delete(id);
	return Results.Ok();
}).RequireAuthorization();

app.MapGet("/api/todos", ([FromServices] ITodoService todoService, TodoState? state) =>
{
	return Results.Ok(todoService.GetTodoItems(state));
}).RequireAuthorization();

app.MapPost("/api/todos/createorupdate", ([FromServices] ITodoService todoService, TodoItem todo) =>
{
	return Results.Ok(todoService.CreateOrUpdate(todo));
}).RequireAuthorization();

app.MapDelete("/api/todos/delete", ([FromServices] ITodoService todoService, Guid id) =>
{
	todoService.Delete(id);
	return Results.Ok();
}).RequireAuthorization();

app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.Run();