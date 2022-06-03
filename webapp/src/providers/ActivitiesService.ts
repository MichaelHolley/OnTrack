import axios from 'axios';
import { Activity, ActivityValue } from '../models';

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

export const getSortedActivities = (activities: Activity[]) => {
	return activities.sort((a, b) => {
		return (
			(b.modified !== undefined && b.modified !== null
				? new Date(b.modified).getTime()
				: new Date(b.created).getTime()) -
			(a.modified !== undefined && a.modified !== null
				? new Date(a.modified).getTime()
				: new Date(a.created).getTime())
		);
	});
};

export const deleteActivityValue = (
	activityId: string,
	date: Date,
	value: number
) => {
	return axios.put<Activity>(URL + '/' + activityId + '/deletevalue', {
		date: formatDate(date),
		value: value,
	});
};

export const updateActivitiyValue = (
	activityId: string,
	oldVal: ActivityValue,
	newVal: ActivityValue
) => {
	return axios.put<Activity>(
		URL + '/' + activityId + '/updatevalue',
		{ date: formatDate(newVal.date), value: newVal.value },
		{
			params: { oldDate: formatDate(oldVal.date), oldVal: oldVal.value },
		}
	);
};
