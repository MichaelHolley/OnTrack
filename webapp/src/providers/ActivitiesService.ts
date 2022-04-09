import { Activity } from './../../models';
import axios from 'axios';

// TODO: Move domain to .env
const URL = 'https://localhost:7008/api/activities';

export const getActivities = () => {
	return axios.get<Activity[]>(URL);
};
