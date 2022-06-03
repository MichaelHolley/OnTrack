using API.Models;
using API.Models.Activity;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface IActivityService
	{
		ICollection<Activity> GetActivities();
		Activity GetActivityById(Guid id);
		Activity Create(Activity activity);
		Activity? Update(Activity activity);
		Activity? AddValue(Guid activityId, ActivityValue value);
		void Delete(Guid activityId);
		Activity DeleteValue(Guid activityId, ActivityValue delete);
		Activity UpdateValue(Guid id, string oldDate, decimal oldVal, ActivityValue update);
	}

	public class ActivityService : IActivityService
	{
		private readonly IMongoCollection<Activity> activityCollection;
		private readonly IHttpContextAccessor httpContextAccessor;
		private FilterDefinitionBuilder<Activity> filterBuilder = Builders<Activity>.Filter;

		public ActivityService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings, IHttpContextAccessor httpContextAccessor)
		{
			var mongoClient = new MongoClient(
				onTrackDatabaseSettings.Value.ConnectionString);

			var mongoDatabase = mongoClient.GetDatabase(
				onTrackDatabaseSettings.Value.DatabaseName);

			activityCollection = mongoDatabase.GetCollection<Activity>(onTrackDatabaseSettings.Value.ActivitiesCollectionName);

			this.httpContextAccessor = httpContextAccessor;
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
			activity.UserId = httpContextAccessor.HttpContext.GetUserId();

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

		public Activity DeleteValue(Guid id, ActivityValue delete)
		{
			var activity = GetActivityById(id);

			if (activity != null)
			{
				activity.Modified = DateTime.UtcNow;
				var val = activity.Values.FirstOrDefault(v => v.Date.Equals(delete.Date) && v.Value == delete.Value);

				if (val != default)
				{
					activity.Values.Remove(val);
					Replace(activity);
				}
			}

			return activity;
		}

		public ICollection<Activity> GetActivities()
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			return activityCollection.Find(a => a.UserId.Equals(userId)).ToList();
		}

		public Activity? GetActivityById(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(a => a.Id.Equals(id) && a.UserId.Equals(userId));
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

		public Activity UpdateValue(Guid id, string oldDate, decimal oldVal, ActivityValue update)
		{
			var activity = GetActivityById(id);

			if (activity != null)
			{
				activity.Modified = DateTime.UtcNow;
				var val = activity.Values.FirstOrDefault(v => v.Date.Equals(oldDate) && v.Value == oldVal);

				if (val != default)
				{
					activity.Values.Remove(val);
					activity.Values.Add(update);
					Replace(activity);
				}
			}

			return activity;
		}

		private void Replace(Activity activity)
		{
			var filter = filterBuilder.Eq(existingActivity => existingActivity.Id, activity.Id);
			activityCollection.ReplaceOne(filter, activity);
		}
	}
}
