using API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static Google.Apis.Auth.GoogleJsonWebSignature;

namespace API.Services
{
	public interface IAuthService
	{
		User Authenticate(Payload payload);
		JwtSecurityToken GenerateAccessToken(string secret, string issuer, User user);
		string GenerateRefreshToken();
		string GenerateAndSetUserRefreshToken(User user);
		ClaimsPrincipal GetPrincipalFromExpiredToken(string token, string secret, string issuer);

	}

	public class AuthService : IAuthService
	{
		private readonly IUserService userService;

		public AuthService(IUserService userService)
		{
			this.userService = userService;
		}

		public User Authenticate(Payload payload)
		{
			return FindUserOrAdd(payload);
		}

		public JwtSecurityToken GenerateAccessToken(string secret, string issuer, User user)
		{
			var claims = new List<Claim>() {
				new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
				new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString())
			};

			var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken(issuer,
			  string.Empty,
			  claims,
			  expires: DateTime.Now.AddDays(1),
			  signingCredentials: creds);

			return token;
		}

		public string GenerateAndSetUserRefreshToken(User user)
		{
			var refreshToken = GenerateRefreshToken();

			userService.UpdateUserRefreshToken(user.Id, refreshToken);

			return refreshToken;
		}

		public string GenerateRefreshToken()
		{
			var randomNumber = new byte[32];
			using (var rng = RandomNumberGenerator.Create())
			{
				rng.GetBytes(randomNumber);
				return Convert.ToBase64String(randomNumber);
			}
		}

		public ClaimsPrincipal GetPrincipalFromExpiredToken(string token, string secret, string issuer)
		{
			var tokenValidationParameters = new TokenValidationParameters
			{
				ValidateAudience = false,
				ValidateIssuer = true,
				ValidIssuer = issuer,
				ValidateIssuerSigningKey = true,
				IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret)),
				ValidateLifetime = false,
			};

			var tokenHandler = new JwtSecurityTokenHandler();
			SecurityToken securityToken;
			var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
			var jwtSecurityToken = securityToken as JwtSecurityToken;

			if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
			{
				throw new SecurityTokenException("Invalid token");
			}

			return principal;
		}

		private User FindUserOrAdd(Payload payload)
		{
			var u = userService.GetUserByMail(payload.Email);

			if (u == null)
			{
				u = new User()
				{
					Name = payload.Name,
					Email = payload.Email,
					OAuthSubject = payload.Subject,
					OAuthIssuer = payload.Issuer
				};

				userService.AddUser(u);
			}

			return u;
		}
	}
}
