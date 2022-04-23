import axios from 'axios';
import { TodoItem, TodoState } from '../models';

const URL = `${process.env.REACT_APP_API_URL}/api/todos`;

export const getTodos = (state: TodoState | undefined = undefined) => {
	const params = { state: state };
	return axios.get<TodoItem[]>(URL, { params: params });
};

export const createOrUpdateTodo = (todo: {
	id?: string;
	title: string;
	state: TodoState;
}) => {
	return axios.post<TodoItem>(URL + '/createorupdate', todo);
};
