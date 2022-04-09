import {
	AppShell,
	Avatar,
	ColorScheme,
	ColorSchemeProvider,
	Group,
	LoadingOverlay,
	MantineProvider,
} from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import React, { useState } from 'react';
import GoogleLogin, {
	GoogleLoginResponse,
	GoogleLogout,
} from 'react-google-login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import VerticalNavbar from './components/Navbar';
import Activities from './views/Activities';
import Todo from './views/Todo';
import Favorites from './views/Favorites';
import Home from './views/Home';

// TODO: Generate new ID and hide within .env-file
const clientId =
	'612496123801-rqf590fa2gata78m3qvfvqheeabpe93b.apps.googleusercontent.com';

function App() {
	const preferredColorScheme = useColorScheme();

	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: preferredColorScheme,
	});

	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	const [user, setUser] = useState<GoogleLoginResponse | undefined>();
	const [loading, setLoading] = useState<boolean>(false);

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
						{user ? (
							<Group position="right">
								<Avatar src={user.profileObj.imageUrl} radius={5} />
								<GoogleLogout
									clientId={clientId}
									buttonText="Logout"
									onLogoutSuccess={() => {
										console.log('User logged out');
										setUser(undefined);
									}}></GoogleLogout>
							</Group>
						) : (
							<Group position="right">
								<GoogleLogin
									clientId={clientId}
									buttonText="Login with Google"
									onSuccess={(response) => {
										console.log(response);
										if ('profileObj' in response) {
											setUser(response);
										}
									}}
									theme="dark"
									onFailure={(err) => {
										console.log(err);
										setUser(undefined);
										// TODO: Clear all stored data and reset views
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
