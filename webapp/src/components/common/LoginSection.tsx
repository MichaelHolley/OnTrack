import { Avatar, Group } from '@mantine/core';
import React from 'react';
import GoogleLogin, {
	GoogleLoginResponse,
	GoogleLoginResponseOffline,
	GoogleLogout,
} from 'react-google-login';
import { loginToApi, useUser } from '../../providers/UserContext';

const LoginSection = () => {
	const userContext = useUser();

	const clearStoredData = () => {
		userContext.setGoogleResponse(undefined);
		userContext.setUser(undefined);
		localStorage.clear();
	};

	const login = (
		response: GoogleLoginResponse | GoogleLoginResponseOffline
	) => {
		if ('profileObj' in response) {
			userContext.setGoogleResponse(response);
			loginToApi(response.tokenId).then((res) => {
				userContext.setUser({ token: res.data.token });
			});
		}
	};

	return (
		<Group position="right">
			{userContext.googleResponse && userContext.user ? (
				<>
					<Avatar
						src={userContext.googleResponse.profileObj.imageUrl}
						radius={5}
					/>
					<GoogleLogout
						clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ''}
						buttonText="Logout"
						onLogoutSuccess={clearStoredData}></GoogleLogout>
				</>
			) : (
				<GoogleLogin
					clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ''}
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
