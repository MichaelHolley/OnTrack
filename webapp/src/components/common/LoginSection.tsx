import { Avatar, Group } from '@mantine/core';
import React, { FunctionComponent } from 'react';
import GoogleLogin, {
	GoogleLoginResponse,
	GoogleLoginResponseOffline,
	GoogleLogout,
} from 'react-google-login';
import {
	removeLocalUserData,
	loginToApi,
	useUser,
	revokeApiToken,
} from '../../providers/UserContext';

interface Props {
	buttonAlignment?: 'right' | 'center';
}

const LoginSection: FunctionComponent<Props> = (props) => {
	const userContext = useUser();

	const clearStoredData = () => {
		userContext.setGoogleResponse(undefined);
		userContext.setUser(undefined);
		removeLocalUserData();
	};

	const login = (
		response: GoogleLoginResponse | GoogleLoginResponseOffline
	) => {
		if ('profileObj' in response) {
			userContext.setGoogleResponse(response);
			loginToApi(response.tokenId).then((res) => {
				userContext.setUser(res.data);
			});
		}
	};

	if (process.env.REACT_APP_GOOGLE_CLIENT_ID === undefined) {
		return <></>;
	}

	return (
		<Group position={props.buttonAlignment ?? 'right'}>
			{userContext.googleResponse && userContext.user ? (
				<>
					<Avatar
						src={userContext.googleResponse.profileObj.imageUrl}
						radius={5}
					/>
					<GoogleLogout
						clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
						buttonText="Logout"
						onLogoutSuccess={async () => {
							await revokeApiToken();
							clearStoredData();
						}}></GoogleLogout>
				</>
			) : (
				<GoogleLogin
					clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
					buttonText="Login with Google"
					onSuccess={(response) => login(response)}
					theme="dark"
					onFailure={(err) => {
						console.error(err);
						clearStoredData();
					}}
					cookiePolicy={'single_host_origin'}></GoogleLogin>
			)}
		</Group>
	);
};

export default LoginSection;
