namespace API.Models
{
	public class User
	{
		public Guid Id { get; set; }
		public DateTime Created { get; set; }
		public string Name { get; set; }
		public string Email { get; set; }
		public string OAuthSubject { get; set; }
		public string OAuthIssuer { get; set; }
	}

	public class UserView
	{
		public string TokenId { get; set; }
	}
}
