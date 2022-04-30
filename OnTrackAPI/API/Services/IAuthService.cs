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
		public User Authenticate(Payload payload);
		public JwtSecurityToken GenerateAccessToken(string secret, User user);
		public string GenerateRefreshToken();
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

		public JwtSecurityToken GenerateAccessToken(string secret, User user)
		{
			var claims = new List<Claim>() {
				new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
				new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString())
			};

			var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
			var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken("OnTrack",
			  string.Empty,
			  claims,
			  expires: DateTime.Now.AddSeconds(10),
			  signingCredentials: creds);

			return token;
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
