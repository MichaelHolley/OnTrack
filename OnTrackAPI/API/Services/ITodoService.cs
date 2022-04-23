using API.Models;
using API.Models.Todo;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface ITodoService
	{
		public ICollection<TodoItem> GetTodoItems();
		public TodoItem CreateTodoItem(string title);
		public TodoItem? UpdateTodoItem(TodoItem item);
	}

	public class TodoService : ITodoService
	{
		private readonly IMongoCollection<TodoItem> todoCollection;
		private readonly IHttpContextAccessor httpContextAccessor;
		private FilterDefinitionBuilder<TodoItem> filterBuilder = Builders<TodoItem>.Filter;

		public TodoService(
				IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings, IHttpContextAccessor httpContextAccessor)
		{
			var mongoClient = new MongoClient(
				onTrackDatabaseSettings.Value.ConnectionString);

			var mongoDatabase = mongoClient.GetDatabase(
				onTrackDatabaseSettings.Value.DatabaseName);

			todoCollection = mongoDatabase.GetCollection<TodoItem>(onTrackDatabaseSettings.Value.TodoItemsCollectionsName);

			this.httpContextAccessor = httpContextAccessor;
		}

		public TodoItem CreateTodoItem(string title)
		{
			TodoItem todo = new TodoItem();
			todo.Id = Guid.NewGuid();
			todo.Title = title;
			todo.Created = DateTime.UtcNow;
			todo.UserId = httpContextAccessor.HttpContext.GetUserId();

			todoCollection.InsertOne(todo);
			return todo;
		}

		public ICollection<TodoItem> GetTodoItems()
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			return todoCollection.Find(t => t.UserId.Equals(userId)).ToList();
		}

		public TodoItem? UpdateTodoItem(TodoItem item)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(item.Id) && t.UserId.Equals(userId));

			var existing = todoCollection.Find(filter).SingleOrDefault();

			if (existing != null)
			{
				existing.Title = item.Title;
				existing.State = item.State;
				existing.Modified = DateTime.UtcNow;

				todoCollection.ReplaceOne(filter, existing);
			}

			return existing;
		}
	}
}
