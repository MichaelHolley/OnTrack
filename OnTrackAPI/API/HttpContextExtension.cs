using System.Security.Claims;

namespace API
{
	public static class HttpContextExtension
	{
		public static Guid GetUserId(this HttpContext httpContext)
		{
			return new Guid(httpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);
		}
	}
}
