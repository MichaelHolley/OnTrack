namespace API.Models.Expense
{
	public class Expense : EntityBase
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public Rythm Rythm { get; set; }
		public decimal Amount { get; set; }
		public string Color { get; set; }
		public DateTime? Deleted { get; set; } = null;
	}
}
