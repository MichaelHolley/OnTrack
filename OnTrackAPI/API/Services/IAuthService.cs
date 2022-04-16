using API.Models;
using static Google.Apis.Auth.GoogleJsonWebSignature;

namespace API.Services
{
	public interface IAuthService
	{
		User Authenticate(Payload payload);
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
			return this.FindUserOrAdd(payload);
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
