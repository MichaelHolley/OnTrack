import {
	AppShell,
	Avatar,
	ColorScheme,
	ColorSchemeProvider,
	Group,
	LoadingOverlay,
	MantineProvider,
	ScrollArea,
} from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import axios from 'axios';
import React, { useState } from 'react';
import GoogleLogin, { GoogleLogout } from 'react-google-login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import VerticalNavbar from './components/Navbar';
import { loginToApi, useUser } from './providers/UserContext';
import Activities from './views/Activities';
import Favorites from './views/Favorites';
import Home from './views/Home';
import Todo from './views/Todo';

axios.interceptors.request.use((config) => {
	if (!config.headers) {
		config.headers = {};
	}

	config.headers.Authorization = `Bearer ${localStorage.getItem(
		'OnTrackApiToken'
	)}`;

	return config;
});

function App() {
	const preferredColorScheme = useColorScheme();

	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: preferredColorScheme,
	});

	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	const [loading, setLoading] = useState<boolean>(false);

	const userContext = useUser();

	return (
		<BrowserRouter>
			<ColorSchemeProvider
				colorScheme={colorScheme}
				toggleColorScheme={toggleColorScheme}>
				<MantineProvider theme={{ colorScheme, primaryColor: 'red' }}>
					<AppShell
						navbar={<VerticalNavbar />}
						sx={(theme) => ({
							backgroundColor:
								theme.colorScheme === 'dark'
									? theme.colors.dark[8]
									: theme.colors.gray[1],
							color: theme.colorScheme === 'dark' ? theme.white : theme.black,
						})}>
						{userContext.googleResponse && userContext.user ? (
							<Group position="right">
								<Avatar
									src={userContext.googleResponse.profileObj.imageUrl}
									radius={5}
								/>
								<GoogleLogout
									clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ''}
									buttonText="Logout"
									onLogoutSuccess={() => {
										console.log('User logged out');
										userContext.setGoogleResponse(undefined);
										userContext.setUser(undefined);
										localStorage.clear();
									}}></GoogleLogout>
							</Group>
						) : (
							<Group position="right">
								<GoogleLogin
									clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ''}
									buttonText="Login with Google"
									onSuccess={(response) => {
										if ('profileObj' in response) {
											userContext.setGoogleResponse(response);
											loginToApi(response.tokenId).then((res) => {
												userContext.setUser(res.data.token);
												localStorage.setItem('OnTrackApiToken', res.data.token);
											});
										}
									}}
									theme="dark"
									onFailure={(err) => {
										console.error(err);
										userContext.setUser(undefined);
										userContext.setGoogleResponse(undefined);
										localStorage.clear();
									}}
									cookiePolicy={'single_host_origin'}></GoogleLogin>
							</Group>
						)}
						<LoadingOverlay visible={loading} />
						<Routes>
							<Route path="" element={<Home setLoading={setLoading} />} />
							<Route
								path="activities"
								element={<Activities setLoading={setLoading} />}
							/>
							<Route
								path="activities/favorites"
								element={<Favorites setLoading={setLoading} />}
							/>
							<Route path="todo" element={<Todo setLoading={setLoading} />} />
						</Routes>
					</AppShell>
				</MantineProvider>
			</ColorSchemeProvider>
		</BrowserRouter>
	);
}

export default App;
