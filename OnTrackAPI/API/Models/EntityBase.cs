namespace API.Models
{
	public class EntityBase
	{
		public DateTime Created { get; set; }
		public DateTime? Modified { get; set; }
		public Guid UserId { get; set; }
	}
}
