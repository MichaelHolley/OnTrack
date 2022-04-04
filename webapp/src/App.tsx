import {
	AppShell,
	ColorScheme,
	ColorSchemeProvider,
	MantineProvider
} from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import VerticalNavbar from './components/Navbar';
import Activities from './views/Activities';
import Add from './views/Add';
import Favorites from './views/Favorites';
import Home from './views/Home';

function App() {
	const preferredColorScheme = useColorScheme();

	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: preferredColorScheme,
	});

	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

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
						<Routes>
							<Route path="" element={<Home />} />
							<Route path="activities" element={<Activities />} />
							<Route path="activities/favorites" element={<Favorites />} />
							<Route path="add" element={<Add />} />
						</Routes>
					</AppShell>
				</MantineProvider>
			</ColorSchemeProvider>
		</BrowserRouter>
	);
}

export default App;
