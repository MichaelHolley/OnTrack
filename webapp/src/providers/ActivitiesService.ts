import axios from 'axios';
import { Activity, ActivityValue } from './../../models';

const URL = `${process.env.REACT_APP_API_URL}/api/activities`;

export const getActivities = () => {
	return axios.get<Activity[]>(URL, { params: {} });
};

export const createActivity = (activity: { title: string }) => {
	return axios.post(URL + '/create', activity);
};

export const addValue = (id: string, value: ActivityValue) => {
	return axios.put(URL + '/' + id + '/addvalue', {
		date: formatDate(value.date),
		value: value.value,
	});
};

export const deleteActivity = (id: string) => {
	return axios.delete(URL + '/' + id + '/delete');
};

export const formatDate = (date: Date) => {
	const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
	const month =
		date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;

	return date.getFullYear() + '-' + month + '-' + day;
};
