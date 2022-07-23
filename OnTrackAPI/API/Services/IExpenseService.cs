using API.Models;
using API.Models.Expense;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface IExpenseService
	{
		Task<ICollection<Expense>> GetExpensesAsync();
		Task<Expense> CreateOrUpdateAsync(Expense expense);
		Task<Expense?> DeleteAsync(Guid id);
		Task<Expense?> ReactivateAsync(Guid id);
	}

	public class ExpenseService : IExpenseService
	{
		private readonly IMongoCollection<Expense> expenseCollection;
		private readonly IHttpContextAccessor httpContextAccessor;
		private FilterDefinitionBuilder<Expense> filterBuilder = Builders<Expense>.Filter;

		public ExpenseService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings,
			IHttpContextAccessor httpContextAccessor,
			ICollectionConnector collectionConnector)
		{
			expenseCollection = collectionConnector.GetCollectionByName<Expense>(onTrackDatabaseSettings.Value.ExpensesCollectionName);
			this.httpContextAccessor = httpContextAccessor;
		}

		public async Task<Expense> CreateOrUpdateAsync(Expense item)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(item.Id) && t.UserId.Equals(userId));

			var existing = (await expenseCollection.FindAsync(filter)).SingleOrDefault();

			if (existing != default)
			{
				existing.Title = item.Title;
				existing.Color = item.Color;
				existing.Rythm = item.Rythm;
				existing.Amount = item.Amount;
				existing.Modified = DateTime.UtcNow;

				await expenseCollection.ReplaceOneAsync(filter, existing);
				return existing;
			}
			else
			{
				Expense expense = new Expense();

				expense.Id = Guid.NewGuid();
				expense.Title = item.Title;
				expense.Color = item.Color;
				expense.Rythm = item.Rythm;
				expense.Amount = item.Amount;
				expense.Created = DateTime.UtcNow;
				expense.UserId = userId;

				await expenseCollection.InsertOneAsync(expense);
				return expense;
			}
		}

		public async Task<Expense?> DeleteAsync(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(id) && t.UserId.Equals(userId));

			var existing = (await expenseCollection.FindAsync(filter)).SingleOrDefault();

			if (existing != default)
			{
				existing.Deleted = DateTime.UtcNow;
				await expenseCollection.ReplaceOneAsync(filter, existing);
			}

			return existing;
		}

		public async Task<Expense?> ReactivateAsync(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(id) && t.UserId.Equals(userId));

			var existing = (await expenseCollection.FindAsync(filter)).SingleOrDefault();

			if (existing != default)
			{
				existing.Deleted = null;
				await expenseCollection.ReplaceOneAsync(filter, existing);
			}

			return existing;
		}

		public async Task<ICollection<Expense>> GetExpensesAsync()
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			return (await expenseCollection.FindAsync(a => a.UserId.Equals(userId))).ToList();
		}
	}
}
