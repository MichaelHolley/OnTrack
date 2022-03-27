using API.Models;

namespace API.Services
{
	public interface IActivityService
	{
		public ICollection<Activity> GetActivities();
		public Activity GetActivityById(Guid id);
		public Activity Create(Activity activity);
		public Activity? Update(Activity activity);
		public Activity? AddValue(Guid activityId, ActivityValue value);
		public void Delete(Guid activityId);
	}
}
