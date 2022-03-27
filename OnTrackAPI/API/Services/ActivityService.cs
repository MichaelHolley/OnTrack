using API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public class ActivityService : IActivityService
	{
		private readonly IMongoCollection<Activity> activityCollection;
		private FilterDefinitionBuilder<Activity> filterBuilder = Builders<Activity>.Filter;

		public ActivityService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings)
		{
			var mongoClient = new MongoClient(
				onTrackDatabaseSettings.Value.ConnectionString);

			var mongoDatabase = mongoClient.GetDatabase(
				onTrackDatabaseSettings.Value.DatabaseName);

			activityCollection = mongoDatabase.GetCollection<Activity>(
				onTrackDatabaseSettings.Value.ActivitiesCollectionName);
		}

		public Activity? AddValue(Guid activityId, ActivityValue value)
		{
			var activity = GetActivityById(activityId);

			if (activity != null)
			{
				activity.Modified = DateTime.UtcNow;
				activity.Values.Add(value);

				Replace(activity);
			}

			return activity;
		}

		public Activity Create(Activity activity)
		{
			activity.Id = Guid.NewGuid();
			activity.Created = DateTime.UtcNow;

			activityCollection.InsertOne(activity);
			return activity;
		}

		public void Delete(Guid activityId)
		{
			var delete = GetActivityById(activityId);

			if (delete != null)
			{
				delete.Deleted = DateTime.UtcNow;

				Replace(delete);
			}
		}

		public ICollection<Activity> GetActivities()
		{
			return activityCollection.Find(_ => true).ToList();
		}

		public Activity GetActivityById(Guid id)
		{
			var filter = filterBuilder.Eq(a => a.Id, id);
			return activityCollection.Find(filter).SingleOrDefault();
		}

		public Activity? Update(Activity activity)
		{
			var existing = GetActivityById(activity.Id);

			if (activity != null)
			{
				existing.Modified = DateTime.UtcNow;
				existing.Title = activity.Title;

				Replace(existing);
			}

			return existing;
		}

		private void Replace(Activity activity)
		{
			var filter = filterBuilder.Eq(existingActivity => existingActivity.Id, activity.Id);
			activityCollection.ReplaceOne(filter, activity);
		}
	}
}
