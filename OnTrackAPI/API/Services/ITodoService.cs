using API.Models;
using API.Models.Todo;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface ITodoService
	{
		public ICollection<TodoItem> GetTodoItems(TodoState? state);
		public TodoItem CreateOrUpdate(TodoItem item);
		public void Delete(Guid id);
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

		public ICollection<TodoItem> GetTodoItems(TodoState? state)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();

			FilterDefinition<TodoItem> filter;
			if (state.HasValue)
			{
				filter = filterBuilder.Where(t => t.State.Equals(state.Value) && t.UserId.Equals(userId));
			}
			else
			{
				filter = filterBuilder.Where(t => t.UserId.Equals(userId));
			}

			return todoCollection.Find(filter).ToList();
		}

		public TodoItem CreateOrUpdate(TodoItem item)
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
				return existing;
			}
			else
			{
				TodoItem todo = new TodoItem();

				todo.Id = Guid.NewGuid();
				todo.Title = item.Title;
				todo.State = item.State;
				todo.Created = DateTime.UtcNow;
				todo.UserId = userId;

				todoCollection.InsertOne(todo);
				return todo;
			}
		}

		public void Delete(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(id) && t.UserId.Equals(userId));

			var existing = todoCollection.Find(filter).SingleOrDefault();

			if (existing != null)
			{
				existing.Deleted = DateTime.UtcNow;
				todoCollection.ReplaceOne(filter, existing);
			}
		}
	}
}
