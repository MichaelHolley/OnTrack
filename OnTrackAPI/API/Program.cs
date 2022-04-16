using API.Models;
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
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Auth:JwtSecret"])),
			ValidateIssuer = false,
			ValidateAudience = false,
		};
	});

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IActivityService, ActivityService>();
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.MapPost("/google-signin", ([FromServices] IAuthService authService, UserView userView) =>
{
	try
	{
		var payload = GoogleJsonWebSignature.ValidateAsync(userView.TokenId, new GoogleJsonWebSignature.ValidationSettings()).Result;
		var user = authService.Authenticate(payload);

		var claims = new[]
		{
			new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
			new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
		};

		var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Auth:JwtSecret"]));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var token = new JwtSecurityToken("OnTrack",
		  String.Empty,
		  claims,
		  expires: DateTime.Now.AddMinutes(120),
		  signingCredentials: creds);

		return Results.Ok(new
		{
			token = new JwtSecurityTokenHandler().WriteToken(token)
		});
	}
	catch (Exception ex)
	{
		return Results.BadRequest(ex.Message);
	}
}).AllowAnonymous();

app.MapGet("/api/activities", ([FromServices] IActivityService activityService, bool? favorites) =>
{
	if (!favorites.HasValue)
	{
		favorites = false;
	}

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

app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.Run();