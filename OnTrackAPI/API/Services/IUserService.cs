using API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface IUserService
	{
		Task<User> GetUserByIdAsync(Guid id);
		Task<User> GetUserByMailAsync(string mail);
		Task AddUserAsync(User user);
		Task UpdateUserRefreshTokenAsync(Guid userId, string? refreshToken);
	}

	public class UserService : IUserService
	{

		private readonly IMongoCollection<User> userCollection;
		private FilterDefinitionBuilder<User> filterBuilder = Builders<User>.Filter;

		public UserService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings,
			ICollectionConnector collectionConnector)
		{
			userCollection = collectionConnector.GetCollectionByName<User>(onTrackDatabaseSettings.Value.UsersCollectionName);
		}

		public async Task AddUserAsync(User user)
		{
			user.Id = Guid.NewGuid();
			user.Created = DateTime.UtcNow;

			await userCollection.InsertOneAsync(user);
		}

		public async Task<User> GetUserByMailAsync(string mail)
		{
			var filter = filterBuilder.Eq(a => a.Email, mail);
			return (await userCollection.FindAsync(filter)).SingleOrDefault();
		}

		public async Task<User> GetUserByIdAsync(Guid id)
		{
			var filter = filterBuilder.Eq(a => a.Id, id);
			return (await userCollection.FindAsync(filter)).SingleOrDefault();
		}

		public async Task UpdateUserRefreshTokenAsync(Guid userId, string? refreshToken)
		{
			var filter = filterBuilder.Eq(a => a.Id, userId);
			var existing = (await userCollection.FindAsync(filter)).SingleOrDefault();

			if (existing != default)
			{
				existing.RefreshToken = refreshToken;
				existing.LastRefresh = DateTime.UtcNow;

				await userCollection.ReplaceOneAsync(filter, existing);
			}
		}
	}
}
