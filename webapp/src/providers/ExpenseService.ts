import axios from 'axios';
import { Expense, Rythm } from '../models';
import { formatDate } from './ActivitiesService';

const URL = `${process.env.REACT_APP_API_URL}/api/expenses`;

export const getExpenses = () => {
	return axios.get<Expense[]>(URL);
};

export const createOrUpdateExpense = (expense: {
	id: string | undefined;
	title: string;
	rythm: Rythm;
	amount: number;
	color: string;
	startDate: Date;
	endDate?: Date;
}) => {
	return axios.post<Expense>(URL + '/createorupdate', {
		id: expense.id,
		title: expense.title,
		rythm: expense.rythm,
		amount: expense.amount,
		color: expense.color,
		startDate: formatDate(expense.startDate),
		endDate: expense.endDate ? formatDate(expense.endDate) : undefined,
	});
};

export const deleteExpense = (id: string) => {
	return axios.delete(URL + '/delete', { params: { id: id } });
};
