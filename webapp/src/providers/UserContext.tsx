import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GoogleLoginResponse } from 'react-google-login';

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
const GOOGLE_RESPONSE_KEY = 'GoogleResponse';

export const UserContext: React.FunctionComponent = (props) => {
	const [user, setUser] = useState<OnTrackUser>();
	const [googleResponse, setGoogleResponse] = useState<GoogleLoginResponse>();

	useEffect(() => {
		const storedUser = localStorage.getItem(USER_KEY);
		if (storedUser) {
			const parsedUser = JSON.parse(storedUser) as OnTrackUser;
			setUser(parsedUser);
		}

		const storedGoogleResponse = localStorage.getItem(GOOGLE_RESPONSE_KEY);
		if (storedGoogleResponse) {
			const parsedResponse = JSON.parse(storedGoogleResponse);
			setGoogleResponse(parsedResponse);
		}
	}, []);

	const setUserData = (user: OnTrackUser | undefined) => {
		setUser(user);
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	};

	const setGoogleResponseData = (
		googleResponse: GoogleLoginResponse | undefined
	) => {
		setGoogleResponse(googleResponse);
		localStorage.setItem(GOOGLE_RESPONSE_KEY, JSON.stringify(googleResponse));
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
