using API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface IUserService
	{
		public User GetUserByMail(string mail);
		public void AddUser(User user);
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
			user.Created = DateTime.Now;

			userCollection.InsertOne(user);
		}

		public User GetUserByMail(string mail)
		{
			var filter = filterBuilder.Eq(a => a.Email, mail);
			return userCollection.Find(filter).SingleOrDefault();
		}

	}
}
