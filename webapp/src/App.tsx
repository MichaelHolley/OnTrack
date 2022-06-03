import {
	AppShell,
	ColorScheme,
	ColorSchemeProvider,
	LoadingOverlay,
	MantineProvider,
} from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import axios from 'axios';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginSection from './components/common/LoginSection';
import VerticalNavbar from './components/common/Navbar';
import {
	OnTrackUser,
	refreshApiToken,
	USER_KEY,
	useUser,
} from './providers/UserContext';
import Activities from './views/Activities';
import Home from './views/Home';
import Todo from './views/Todo';

axios.interceptors.request.use(async (config) => {
	if (!config.headers) {
		config.headers = {};
	}

	const storedUser = localStorage.getItem(USER_KEY);
	if (storedUser) {
		const parsedUser = JSON.parse(storedUser) as OnTrackUser;

		if (parsedUser !== undefined && !config.url?.endsWith('refresh-token')) {
			const decoded = jwtDecode(parsedUser?.token) as JwtPayload;
			if (decoded.exp !== undefined && Date.now() >= decoded.exp * 1000) {
				await refreshApiToken(parsedUser);
			}
		}

		config.headers.Authorization = `Bearer ${parsedUser.token}`;
	}

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
					<ModalsProvider>
						<AppShell
							navbar={<VerticalNavbar />}
							sx={(theme) => ({
								backgroundColor:
									theme.colorScheme === 'dark'
										? theme.colors.dark[8]
										: theme.colors.gray[1],
								color: theme.colorScheme === 'dark' ? theme.white : theme.black,
							})}>
							<LoadingOverlay visible={loading} />

							<LoginSection />

							{userContext.user && userContext.googleResponse && (
								<Routes>
									<Route path="" element={<Home setLoading={setLoading} />} />
									<Route
										path="activities"
										element={<Activities setLoading={setLoading} />}
									/>
									<Route
										path="todo"
										element={
											<Todo
												setLoading={setLoading}
												showComplete={true}
												flatDistributionIndicator={true}
											/>
										}
									/>
								</Routes>
							)}
						</AppShell>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</BrowserRouter>
	);
}

export default App;
