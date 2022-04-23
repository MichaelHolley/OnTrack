namespace API.Models
{
	public class OnTrackDatabaseSettings
	{
		public string ConnectionString { get; set; } = null!;
		public string DatabaseName { get; set; } = null!;
		public string ActivitiesCollectionName { get; set; } = null!;
		public string UsersCollectionName { get; set; } = null!;
		public string TodoItemsCollectionsName { get; set; } = null!;
	}
}
