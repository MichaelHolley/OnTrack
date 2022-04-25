namespace API.Models.Todo
{
	public class TodoItem : EntityBase
	{
		public Guid Id { get; set; }
		public string Title { get; set; }
		public TodoState State { get; set; }
		public DateTime? Deleted { get; set; }
	}
}
