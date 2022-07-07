import { Expense, Rythm } from './../../models';

export const expenseToDaily = (exp: Expense) => {
	switch (exp.rythm) {
		case Rythm.Daily:
			return exp.amount;
		case Rythm.Weekly:
			return exp.amount / 7;
		case Rythm.Monthly:
			return (exp.amount * 12) / 365;
		case Rythm.Quarterly:
			return (exp.amount * 4) / 365;
		case Rythm.HalfYearly:
			return (exp.amount * 2) / 365;
		case Rythm.Year:
			return exp.amount / 365;
	}
};

export const expenseToMonthly = (exp: Expense) => {
	switch (exp.rythm) {
		case Rythm.Daily:
			return (exp.amount * 365) / 12;
		case Rythm.Weekly:
			return ((exp.amount / 7) * 365) / 12;
		case Rythm.Monthly:
			return exp.amount;
		case Rythm.Quarterly:
			return (exp.amount * 4) / 12;
		case Rythm.HalfYearly:
			return (exp.amount * 2) / 12;
		case Rythm.Year:
			return exp.amount / 12;
	}
};

export const expenseToYearly = (exp: Expense) => {
	switch (exp.rythm) {
		case Rythm.Daily:
			return exp.amount * 365;
		case Rythm.Weekly:
			return (exp.amount / 7) * 365;
		case Rythm.Monthly:
			return exp.amount * 12;
		case Rythm.Quarterly:
			return exp.amount * 4;
		case Rythm.HalfYearly:
			return exp.amount * 2;
		case Rythm.Year:
			return exp.amount;
	}
};
