using API.Models;
using API.Models.Activity;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface IActivityService
	{
		Task<ICollection<Activity>> GetActivitiesAsync();
		Task<Activity> GetActivityByIdAsync(Guid id);
		Task<Activity> CreateAsync(Activity activity);
		Task<Activity?> UpdateAsync(Activity activity);
		Task<Activity?> AddValueAsync(Guid activityId, ActivityValue value);
		Task DeleteAsync(Guid activityId);
		Task<Activity> DeleteValueAsync(Guid activityId, ActivityValue delete);
		Task<Activity> UpdateValueAsync(Guid id, string oldDate, decimal oldVal, ActivityValue update);
	}

	public class ActivityService : IActivityService
	{
		private readonly IMongoCollection<Activity> activityCollection;
		private readonly IHttpContextAccessor httpContextAccessor;
		private FilterDefinitionBuilder<Activity> filterBuilder = Builders<Activity>.Filter;

		public ActivityService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings,
			IHttpContextAccessor httpContextAccessor,
			ICollectionConnector collectionConnector)
		{
			activityCollection = collectionConnector.GetCollectionByName<Activity>(onTrackDatabaseSettings.Value.ActivitiesCollectionName);
			this.httpContextAccessor = httpContextAccessor;
		}

		public async Task<Activity?> AddValueAsync(Guid activityId, ActivityValue value)
		{
			var activity = await GetActivityByIdAsync(activityId);

			if (activity != default)
			{
				activity.Modified = DateTime.UtcNow;
				activity.Values.Add(value);

				await ReplaceAsync(activity);
			}

			return activity;
		}

		public async Task<Activity> CreateAsync(Activity activity)
		{
			activity.Id = Guid.NewGuid();
			activity.Created = DateTime.UtcNow;
			activity.UserId = httpContextAccessor.HttpContext.GetUserId();

			await activityCollection.InsertOneAsync(activity);
			return activity;
		}

		public async Task DeleteAsync(Guid activityId)
		{
			var delete = await GetActivityByIdAsync(activityId);

			if (delete != default)
			{
				delete.Deleted = DateTime.UtcNow;
				await ReplaceAsync(delete);
			}
		}

		public async Task<Activity> DeleteValueAsync(Guid id, ActivityValue delete)
		{
			var activity = await GetActivityByIdAsync(id);

			if (activity != default)
			{
				activity.Modified = DateTime.UtcNow;
				var val = activity.Values.FirstOrDefault(v => v.Date.Equals(delete.Date) && v.Value == delete.Value);

				if (val != default)
				{
					activity.Values.Remove(val);
					await ReplaceAsync(activity);
				}
			}

			return activity;
		}

		public async Task<ICollection<Activity>> GetActivitiesAsync()
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			return activityCollection.Find(a => a.UserId.Equals(userId)).ToList();
		}

		public async Task<Activity?> GetActivityByIdAsync(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(a => a.Id.Equals(id) && a.UserId.Equals(userId));
			return activityCollection.Find(filter).SingleOrDefault();
		}

		public async Task<Activity?> UpdateAsync(Activity activity)
		{
			var existing = await GetActivityByIdAsync(activity.Id);

			if (activity != default)
			{
				existing.Modified = DateTime.UtcNow;
				existing.Title = activity.Title;

				await ReplaceAsync(existing);
			}

			return existing;
		}

		public async Task<Activity> UpdateValueAsync(Guid id, string oldDate, decimal oldVal, ActivityValue update)
		{
			var activity = await GetActivityByIdAsync(id);

			if (activity != default)
			{
				activity.Modified = DateTime.UtcNow;
				var val = activity.Values.FirstOrDefault(v => v.Date.Equals(oldDate) && v.Value == oldVal);

				if (val != default)
				{
					activity.Values.Remove(val);
					activity.Values.Add(update);
					await ReplaceAsync(activity);
				}
			}

			return activity;
		}

		private async Task ReplaceAsync(Activity activity)
		{
			var filter = filterBuilder.Eq(existingActivity => existingActivity.Id, activity.Id);
			await activityCollection.ReplaceOneAsync(filter, activity);
		}
	}
}
