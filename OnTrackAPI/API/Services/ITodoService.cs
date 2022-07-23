using API.Models;
using API.Models.Todo;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface ITodoService
	{
		Task<ICollection<TodoItem>> GetTodoItemsAsync(TodoState? state);
		Task<TodoItem> CreateOrUpdateAsync(TodoItem item);
		Task DeleteAsync(Guid id);
	}

	public class TodoService : ITodoService
	{
		private readonly IMongoCollection<TodoItem> todoCollection;
		private readonly IHttpContextAccessor httpContextAccessor;
		private FilterDefinitionBuilder<TodoItem> filterBuilder = Builders<TodoItem>.Filter;

		public TodoService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings,
			IHttpContextAccessor httpContextAccessor,
			ICollectionConnector collectionConnector)
		{
			todoCollection = collectionConnector.GetCollectionByName<TodoItem>(onTrackDatabaseSettings.Value.TodoItemsCollectionName);
			this.httpContextAccessor = httpContextAccessor;
		}

		public async Task<ICollection<TodoItem>> GetTodoItemsAsync(TodoState? state)
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

			return (await todoCollection.FindAsync(filter)).ToList();
		}

		public async Task<TodoItem> CreateOrUpdateAsync(TodoItem item)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(item.Id) && t.UserId.Equals(userId));

			var existing = (await todoCollection.FindAsync(filter)).SingleOrDefault();

			if (existing != default)
			{
				existing.Title = item.Title;
				existing.State = item.State;
				existing.Modified = DateTime.UtcNow;

				await todoCollection.ReplaceOneAsync(filter, existing);
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

				await todoCollection.InsertOneAsync(todo);
				return todo;
			}
		}

		public async Task DeleteAsync(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(id) && t.UserId.Equals(userId));

			var existing = (await todoCollection.FindAsync(filter)).SingleOrDefault();

			if (existing != default)
			{
				existing.Deleted = DateTime.UtcNow;
				await todoCollection.ReplaceOneAsync(filter, existing);
			}
		}
	}
}
