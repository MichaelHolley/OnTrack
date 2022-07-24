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
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginSection from './components/common/LoginSection';
import VerticalNavbar from './components/common/Navbar';
import {
	getOnTrackUser,
	setOnTrackUser,
} from './providers/LocalStorageService';
import { refreshApiToken, useUser } from './providers/UserContext';
import Activities from './views/Activities';
import Expenses from './views/Expenses';
import Home from './views/Home';
import LoggedOut from './views/LoggedOut';
import Todo from './views/Todo';

axios.interceptors.request.use(
	(config) => {
		if (!config.headers) {
			config.headers = {};
		}

		const storedUser = getOnTrackUser();
		if (storedUser) {
			config.headers.Authorization = `Bearer ${storedUser.token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	(res) => {
		return res;
	},
	async (err) => {
		const originalConfig = err.config;
		if (!originalConfig.url.endsWith('google-signin') && err.response) {
			if (err.response.status === 401 && !originalConfig._retry) {
				originalConfig._retry = true;
				try {
					const storedUser = getOnTrackUser();
					if (storedUser) {
						const rs = await refreshApiToken(storedUser);
						setOnTrackUser(rs.data);
						return axios(originalConfig);
					}
				} catch (_error) {
					return Promise.reject(_error);
				}
			}
		}
		return Promise.reject(err);
	}
);

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

	const isUserLoggedIn = () => {
		return userContext.user && userContext.googleResponse;
	};

	return (
		<BrowserRouter>
			<ColorSchemeProvider
				colorScheme={colorScheme}
				toggleColorScheme={toggleColorScheme}>
				<MantineProvider theme={{ colorScheme, primaryColor: 'red' }}>
					<ModalsProvider>
						<AppShell
							fixed
							navbar={<VerticalNavbar />}
							sx={(theme) => ({
								backgroundColor:
									theme.colorScheme === 'dark'
										? theme.colors.dark[8]
										: theme.colors.gray[1],
								color: theme.colorScheme === 'dark' ? theme.white : theme.black,
							})}>
							<LoadingOverlay visible={loading} />

							{isUserLoggedIn() ? (
								<>
									<LoginSection />
									<Routes>
										<Route path="" element={<Home setLoading={setLoading} />} />
										<Route
											path="activities"
											element={
												<Activities
													setLoading={setLoading}
													showCreateButton={true}
												/>
											}
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
										<Route
											path="expenses"
											element={<Expenses setLoading={setLoading} />}
										/>
									</Routes>
								</>
							) : (
								<LoggedOut />
							)}
						</AppShell>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</BrowserRouter>
	);
}

export default App;
