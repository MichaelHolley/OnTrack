﻿namespace API.Models
{
	public class OnTrackDatabaseSettings
	{
		public string ConnectionString { get; set; } = null!;

		public string DatabaseName { get; set; } = null!;

		public string ActivitiesCollectionName { get; set; } = null!;
	}
}
