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
app.MapPost("/google-signin", ([FromServices] IAuthService authService, UserView userView) =>
{
	try
	{
		var payload = GoogleJsonWebSignature.ValidateAsync(userView.TokenId, new GoogleJsonWebSignature.ValidationSettings()).Result;
		var user = authService.Authenticate(payload);

		var token = authService.GenerateAccessToken(builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"], user);
		var refreshToken = authService.GenerateAndSetUserRefreshToken(user);

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
app.MapPost("/refresh-token", ([FromServices] IAuthService authService, [FromServices] IUserService userService, UserView userView) =>
{
	try
	{
		var principal = authService.GetPrincipalFromExpiredToken(userView.TokenId, builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"]);

		var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
		var user = userService.GetUserById(Guid.Parse(userId));

		if (userView.TokenId == null || userView.RefreshToken == null || user == null || user.RefreshToken != userView.RefreshToken)
		{
			return Results.BadRequest("Invalid client-request");
		}

		var newAccessToken = authService.GenerateAccessToken(builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"], user);
		var newRefreshToken = authService.GenerateAndSetUserRefreshToken(user);

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
app.MapPost("/revoke-token", ([FromServices] IAuthService authService, [FromServices] IUserService userService, UserView userView) =>
{
	try
	{
		var principal = authService.GetPrincipalFromExpiredToken(userView.TokenId, builder.Configuration["Auth:JwtSecret"], builder.Configuration["Auth:ValidIssuer"]);

		var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
		var user = userService.GetUserById(Guid.Parse(userId));

		if (userView.TokenId == null || userView.RefreshToken == null || user == null || user.RefreshToken != userView.RefreshToken)
		{
			return Results.BadRequest("Invalid client-request");
		}
		else
		{
			userService.UpdateUserRefreshToken(user.Id, null);

			return Results.Ok("Token revoked.");
		}
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

app.MapPut("/api/activities/{id}/deletevalue", ([FromServices] IActivityService activityService, Guid id, ActivityValue delete) =>
{
	var activity = activityService.DeleteValue(id, delete);
	return Results.Ok(activity);
}).RequireAuthorization();

app.MapPut("/api/activities/{id}/updatevalue", ([FromServices] IActivityService activityService, Guid id, string oldDate, decimal oldVal, ActivityValue update) =>
{
	var activity = activityService.UpdateValue(id, oldDate, oldVal, update);
	return Results.Ok(activity);
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

app.MapGet("/api/expenses", ([FromServices] IExpenseService expenseService) =>
{
	return Results.Ok(expenseService.GetExpenses());
}).RequireAuthorization();

app.MapPost("/api/expenses/createorupdate", ([FromServices] IExpenseService expenseService, Expense expense) =>
{
	return Results.Ok(expenseService.CreateOrUpdate(expense));
}).RequireAuthorization();

app.MapDelete("/api/expenses/delete", ([FromServices] IExpenseService expenseService, Guid id) =>
{
	expenseService.Delete(id);
	return Results.Ok();
}).RequireAuthorization();

app.MapPut("/api/expenses/reactivate", ([FromServices] IExpenseService expenseService, Guid id) =>
{
	expenseService.Reactivate(id);
	return Results.Ok();
}).RequireAuthorization();

app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.Run();