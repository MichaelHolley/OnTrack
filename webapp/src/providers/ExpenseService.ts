import axios from 'axios';
import { Expense, Rythm } from '../models';

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
}) => {
	return axios.post<Expense>(URL + '/createorupdate', {
		id: expense.id,
		title: expense.title,
		rythm: expense.rythm,
		amount: expense.amount,
		color: expense.color,
	});
};

export const deleteExpense = (id: string) => {
	return axios.delete(URL + '/delete', { params: { id: id } });
};

export const reactivateExpense = (id: string) => {
	return axios.put(URL + '/reactivate', undefined, { params: { id: id } });
};
