import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GoogleLoginResponse } from 'react-google-login';
import {
	getGoogleLoginResponse,
	getOnTrackUser,
	setGoogleLoginResponse,
	setOnTrackUser,
} from './LocalStorageService';

export interface OnTrackUser {
	token: string;
	refreshToken: string;
}

interface Props {
	user: OnTrackUser | undefined;
	googleResponse: GoogleLoginResponse | undefined;
	setUser: (user: OnTrackUser | undefined) => void;
	setGoogleResponse: (googleResponse: GoogleLoginResponse | undefined) => void;
}

const Context = React.createContext<Props>({
	user: undefined,
	googleResponse: undefined,
	setUser: () => {
		return;
	},
	setGoogleResponse: () => {
		return;
	},
});

export const USER_KEY = 'OnTrackUser';
export const GOOGLE_RESPONSE_KEY = 'GoogleResponse';

export const UserContext: React.FunctionComponent = (props) => {
	const [user, setUser] = useState<OnTrackUser>();
	const [googleResponse, setGoogleResponse] = useState<GoogleLoginResponse>();

	useEffect(() => {
		const storedUser = getOnTrackUser();
		if (storedUser) {
			setUser(storedUser);
		}

		const storedGoogleResponse = getGoogleLoginResponse();
		if (storedGoogleResponse) {
			setGoogleResponse(storedGoogleResponse);
		}
	}, []);

	const setUserData = (user: OnTrackUser | undefined) => {
		setUser(user);
		setOnTrackUser(user);
	};

	const setGoogleResponseData = (
		googleResponse: GoogleLoginResponse | undefined
	) => {
		setGoogleResponse(googleResponse);
		setGoogleLoginResponse(googleResponse);
	};

	return (
		<Context.Provider
			value={{
				user,
				googleResponse,
				setUser: setUserData,
				setGoogleResponse: setGoogleResponseData,
			}}>
			{props.children}
		</Context.Provider>
	);
};

export const UserContextConsumer = Context.Consumer;
export const useUser = () => React.useContext(Context);

export const loginToApi = (googleToken: string) => {
	return axios.post<OnTrackUser>(
		`${process.env.REACT_APP_API_URL}/google-signin`,
		{
			tokenId: googleToken,
		}
	);
};

export const refreshApiToken = (user: OnTrackUser) => {
	return axios.post<OnTrackUser>(
		`${process.env.REACT_APP_API_URL}/refresh-token`,
		{
			tokenId: user.token,
			refreshToken: user.refreshToken,
		}
	);
};

export const revokeApiToken = () => {
	const user = getOnTrackUser();

	return axios.post<OnTrackUser>(
		`${process.env.REACT_APP_API_URL}/revoke-token`,
		{
			tokenId: user?.token,
			refreshToken: user?.refreshToken,
		}
	);
};

export const removeLocalUserData = () => {
	localStorage.removeItem(USER_KEY);
	localStorage.removeItem(GOOGLE_RESPONSE_KEY);
};
