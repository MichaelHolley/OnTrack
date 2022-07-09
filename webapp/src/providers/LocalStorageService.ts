import { GoogleLoginResponse } from 'react-google-login';
import { OnTrackUser, USER_KEY, GOOGLE_RESPONSE_KEY } from './UserContext';

export const setOnTrackUser = (user: OnTrackUser | undefined) => {
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const setGoogleLoginResponse = (response: GoogleLoginResponse | undefined) => {
	localStorage.setItem(GOOGLE_RESPONSE_KEY, JSON.stringify(response));
};

export const getOnTrackUser = () => {
	const storedUser = localStorage.getItem(USER_KEY);
	return storedUser ? (JSON.parse(storedUser) as OnTrackUser) : undefined;
};

export const getGoogleLoginResponse = () => {
	const storedResponse = localStorage.getItem(GOOGLE_RESPONSE_KEY);
	return storedResponse
		? (JSON.parse(storedResponse) as GoogleLoginResponse)
		: undefined;
};
