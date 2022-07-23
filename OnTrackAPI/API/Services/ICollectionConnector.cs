using API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface ICollectionConnector
	{
		IMongoCollection<T> GetCollectionByName<T>(string collectionName);
	}

	public class CollectionConnector : ICollectionConnector
	{
		private readonly IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings;

		public CollectionConnector(IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings)
		{
			this.onTrackDatabaseSettings = onTrackDatabaseSettings;
		}

		public IMongoCollection<T> GetCollectionByName<T>(string collectionName)
		{
			var mongoClient = new MongoClient(onTrackDatabaseSettings.Value.ConnectionString);
			var mongoDatabase = mongoClient.GetDatabase(onTrackDatabaseSettings.Value.DatabaseName);

			return mongoDatabase.GetCollection<T>(collectionName);
		}
	}
}
