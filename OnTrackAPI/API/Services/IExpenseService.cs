using API.Models;
using API.Models.Expense;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace API.Services
{
	public interface IExpenseService
	{
		ICollection<Expense> GetExpenses();
		Expense CreateOrUpdate(Expense expense);
		Expense Delete(Guid id);
		Expense Reactivate(Guid id);
	}

	public class ExpenseService : IExpenseService
	{
		private readonly IMongoCollection<Expense> expenseCollection;
		private readonly IHttpContextAccessor httpContextAccessor;
		private FilterDefinitionBuilder<Expense> filterBuilder = Builders<Expense>.Filter;

		public ExpenseService(
			IOptions<OnTrackDatabaseSettings> onTrackDatabaseSettings, IHttpContextAccessor httpContextAccessor)
		{
			var mongoClient = new MongoClient(
				onTrackDatabaseSettings.Value.ConnectionString);

			var mongoDatabase = mongoClient.GetDatabase(
				onTrackDatabaseSettings.Value.DatabaseName);

			expenseCollection = mongoDatabase.GetCollection<Expense>(onTrackDatabaseSettings.Value.ExpensesCollectionName);

			this.httpContextAccessor = httpContextAccessor;
		}

		public Expense CreateOrUpdate(Expense item)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(item.Id) && t.UserId.Equals(userId));

			var existing = expenseCollection.Find(filter).SingleOrDefault();

			if (existing != default)
			{
				existing.Title = item.Title;
				existing.Color = item.Color;
				existing.Rythm = item.Rythm;
				existing.Amount = item.Amount;
				existing.Modified = DateTime.UtcNow;

				expenseCollection.ReplaceOne(filter, existing);
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

				expenseCollection.InsertOne(expense);
				return expense;
			}
		}

		public Expense Delete(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(id) && t.UserId.Equals(userId));

			var existing = expenseCollection.Find(filter).SingleOrDefault();

			if (existing != default)
			{
				existing.Deleted = DateTime.UtcNow;
				expenseCollection.ReplaceOne(filter, existing);
			}

			return existing;
		}

		public Expense Reactivate(Guid id)
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			var filter = filterBuilder.Where(t => t.Id.Equals(id) && t.UserId.Equals(userId));

			var existing = expenseCollection.Find(filter).SingleOrDefault();

			if (existing != default)
			{
				existing.Deleted = null;
				expenseCollection.ReplaceOne(filter, existing);
			}

			return existing;
		}

		public ICollection<Expense> GetExpenses()
		{
			var userId = httpContextAccessor.HttpContext.GetUserId();
			return expenseCollection.Find(a => a.UserId.Equals(userId)).ToList();
		}
	}
}
