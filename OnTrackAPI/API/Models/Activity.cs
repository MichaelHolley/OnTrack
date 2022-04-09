namespace API.Models
{
	public class Activity : EntityBase
	{
		public Guid Id { get; set; }
		public string? Title { get; set; }
		public ICollection<ActivityValue> Values { get; set; } = new List<ActivityValue>();
		public bool IsFavorit { get; set; }
		public DateTime? Deleted { get; set; } = null;
	}
}
