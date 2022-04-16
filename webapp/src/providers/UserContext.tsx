import axios from 'axios';
import React, { useState } from 'react';
import { GoogleLoginResponse } from 'react-google-login';

export interface OnTrackUser {
	token: string;
}

interface Props {
	user: OnTrackUser | undefined;
	setUser: (user: OnTrackUser | undefined) => void;
	googleResponse: GoogleLoginResponse | undefined;
	setGoogleResponse: (googleResponse: GoogleLoginResponse | undefined) => void;
}

const Context = React.createContext<Props>({
	user: undefined,
	setUser: () => {},
	googleResponse: undefined,
	setGoogleResponse: () => {},
});

export const UserContext: React.FunctionComponent = (props) => {
	const [user, setUser] = useState<OnTrackUser>();
	const [googleResponse, setGoogleResponse] = useState<GoogleLoginResponse>();

	return (
		<Context.Provider
			value={{
				user,
				setUser,
				googleResponse,
				setGoogleResponse,
			}}>
			{props.children}
		</Context.Provider>
	);
};

export const UserContextConsumer = Context.Consumer;
export const useUser = () => React.useContext(Context);

export const loginToApi = (googleToken: string) => {
	return axios.post('https://localhost:7008/google-signin', {
		tokenId: googleToken,
	});
};
