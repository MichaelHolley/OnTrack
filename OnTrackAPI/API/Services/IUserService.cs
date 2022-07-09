using API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface IUserService
	{
		User GetUserById(Guid id);
		User GetUserByMail(string mail);
		void AddUser(User user);
		void UpdateUserRefreshToken(Guid userId, string? refreshToken);
	}

	public class UserService : IUserService
	{

		private readonly IMongoCollection<User> userCollection;
		private FilterDefinitionBuilder<User> filterBuilder = Builders<User>.Filter;

		public UserService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings)
		{
			var mongoClient = new MongoClient(
						  onTrackDatabaseSettings.Value.ConnectionString);

			var mongoDatabase = mongoClient.GetDatabase(
				onTrackDatabaseSettings.Value.DatabaseName);

			userCollection = mongoDatabase.GetCollection<User>(
				onTrackDatabaseSettings.Value.UsersCollectionName);
		}

		public void AddUser(User user)
		{
			user.Id = Guid.NewGuid();
			user.Created = DateTime.UtcNow;

			userCollection.InsertOne(user);
		}

		public User GetUserByMail(string mail)
		{
			var filter = filterBuilder.Eq(a => a.Email, mail);
			return userCollection.Find(filter).SingleOrDefault();
		}

		public User GetUserById(Guid id)
		{
			var filter = filterBuilder.Eq(a => a.Id, id);
			return userCollection.Find(filter).SingleOrDefault();
		}

		public void UpdateUserRefreshToken(Guid userId, string? refreshToken)
		{
			var filter = filterBuilder.Eq(a => a.Id, userId);
			var existing = userCollection.Find(filter).SingleOrDefault();

			if (existing != default)
			{
				existing.RefreshToken = refreshToken;
				existing.LastRefresh = DateTime.UtcNow;

				userCollection.ReplaceOne(filter, existing);
			}
		}
	}
}
