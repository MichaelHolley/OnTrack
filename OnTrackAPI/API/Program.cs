using API.Models;
using API.Models.Activity;
using API.Models.Expense;
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
			ValidateLifetime = true,
			ClockSkew = TimeSpan.FromMinutes(1),
		};
	});

builder.Services.AddAuthorization();

builder.Services.AddSingleton<ICollectionConnector, CollectionConnector>();
builder.Services.AddSingleton<IActivityService, ActivityService>();
builder.Services.AddSingleton<ITodoService, TodoService>();
builder.Services.AddSingleton<IExpenseService, ExpenseService>();
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

/// <summary>
/// Login using Google-Token
/// </summary>
app.MapPost("/google-signin", async ([FromServices] IAuthService authService, UserView userView) =>
{
	try
	{
		var payload = GoogleJsonWebSignature.ValidateAsync(userView.TokenId, new GoogleJsonWebSignature.ValidationSettings()).Result;
		var user = await authService.AuthenticateAsync(payload);

		var token = authService.GenerateAccessToken(builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"], user);
		var refreshToken = await authService.GenerateAndSetUserRefreshTokenAsync(user);

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
/// Refresh OnTrackAPI-Token - requiring previous API-Token and Refresh-Token
/// </summary>
app.MapPost("/refresh-token", async ([FromServices] IAuthService authService, [FromServices] IUserService userService, UserView userView) =>
{
	try
	{
		var principal = authService.GetPrincipalFromExpiredToken(userView.TokenId, builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"]);

		var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
		var user = await userService.GetUserByIdAsync(Guid.Parse(userId));

		if (userView.TokenId == null || userView.RefreshToken == null || user == null || user.RefreshToken != userView.RefreshToken)
		{
			return Results.BadRequest("Invalid client-request");
		}

		var newAccessToken = authService.GenerateAccessToken(builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"], user);
		var newRefreshToken = await authService.GenerateAndSetUserRefreshTokenAsync(user);

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

/// <summary>
/// Revoke OnTrackAPI-Token - requiring API-Token and Refresh-Token
/// </summary>
app.MapPost("/revoke-token", async ([FromServices] IAuthService authService, [FromServices] IUserService userService, UserView userView) =>
{
	try
	{
		var principal = authService.GetPrincipalFromExpiredToken(userView.TokenId, builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"]);

		var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
		var user = await userService.GetUserByIdAsync(Guid.Parse(userId));

		if (userView.TokenId == null || userView.RefreshToken == null || user == null)
		{
			return Results.BadRequest("Invalid client-request");
		}
		else
		{
			await userService.UpdateUserRefreshTokenAsync(user.Id, null);

			return Results.Ok("Token revoked.");
		}
	}
	catch (Exception ex)
	{
		return Results.BadRequest(ex.Message);
	}
}).AllowAnonymous();

app.MapGet("/api/activities", async ([FromServices] IActivityService activityService) =>
{
	return Results.Ok(await activityService.GetActivitiesAsync());
}).RequireAuthorization();

app.MapGet("/api/activities/{id}", async ([FromServices] IActivityService activityService, Guid id) =>
{
	return Results.Ok(await activityService.GetActivityByIdAsync(id));
}).RequireAuthorization();

app.MapPost("/api/activities/create", async ([FromServices] IActivityService activityService, Activity activity) =>
{
	return Results.Created($"/api/activities/{activity.Id}", await activityService.CreateAsync(activity));
}).RequireAuthorization();

app.MapPut("/api/activities/{id}/addvalue", async ([FromServices] IActivityService activityService, Guid id, ActivityValue value) =>
{
	return Results.Ok(await activityService.AddValueAsync(id, value));
}).RequireAuthorization();

app.MapPut("/api/activities/{id}/update", async ([FromServices] IActivityService activityService, Activity activity) =>
{
	return Results.Ok(await activityService.UpdateAsync(activity));
}).RequireAuthorization();

app.MapDelete("/api/activities/{id}/delete", async ([FromServices] IActivityService activityService, Guid id) =>
{
	await activityService.DeleteAsync(id);
	return Results.Ok();
}).RequireAuthorization();

app.MapPut("/api/activities/{id}/deletevalue", async ([FromServices] IActivityService activityService, Guid id, ActivityValue delete) =>
{
	var activity = await activityService.DeleteValueAsync(id, delete);
	return Results.Ok(activity);
}).RequireAuthorization();

app.MapPut("/api/activities/{id}/updatevalue", async ([FromServices] IActivityService activityService, Guid id, string oldDate, decimal oldVal, ActivityValue update) =>
{
	var activity = await activityService.UpdateValueAsync(id, oldDate, oldVal, update);
	return Results.Ok(activity);
}).RequireAuthorization();

app.MapGet("/api/todos", async ([FromServices] ITodoService todoService, TodoState? state) =>
{
	return Results.Ok(await todoService.GetTodoItemsAsync(state));
}).RequireAuthorization();

app.MapPost("/api/todos/createorupdate", async ([FromServices] ITodoService todoService, TodoItem todo) =>
{
	return Results.Ok(await todoService.CreateOrUpdateAsync(todo));
}).RequireAuthorization();

app.MapDelete("/api/todos/delete", async ([FromServices] ITodoService todoService, Guid id) =>
{
	await todoService.DeleteAsync(id);
	return Results.Ok();
}).RequireAuthorization();

app.MapGet("/api/expenses", async ([FromServices] IExpenseService expenseService) =>
{
	return Results.Ok(await expenseService.GetExpensesAsync());
}).RequireAuthorization();

app.MapPost("/api/expenses/createorupdate", async ([FromServices] IExpenseService expenseService, Expense expense) =>
{
	return Results.Ok(await expenseService.CreateOrUpdateAsync(expense));
}).RequireAuthorization();

app.MapDelete("/api/expenses/delete", async ([FromServices] IExpenseService expenseService, Guid id) =>
{
	return Results.Ok(await expenseService.DeleteAsync(id));
}).RequireAuthorization();

app.MapPut("/api/expenses/reactivate", async ([FromServices] IExpenseService expenseService, Guid id) =>
{
	return Results.Ok(await expenseService.ReactivateAsync(id));
}).RequireAuthorization();

app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.Run();