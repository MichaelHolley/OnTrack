import { Center, List, Space, ThemeIcon, Title } from '@mantine/core';
import React, { FunctionComponent, useEffect } from 'react';
import { CircleCheck } from 'tabler-icons-react';
import LoginSection from '../components/common/LoginSection';

const LoggedOut: FunctionComponent = () => {
	useEffect(() => {
		document.title = 'OnTrack | Home';
	}, []);

	return (
		<div>
			<Space h={'lg'} />
			<Title order={1} align="center">
				OnTrack
			</Title>
			<Space h={'xl'} />
			<LoginSection buttonAlignment="center" />
			<Space h={'lg'} />
			<Title order={3} align="center">
				to access the following features:
			</Title>
			<Space h={'sm'} />
			<Center>
				<List
					spacing="xs"
					icon={
						<ThemeIcon
							color="teal"
							size={24}
							radius="xl"
							variant="gradient"
							gradient={{ from: 'teal', to: 'lime', deg: 105 }}>
							<CircleCheck size={18} />
						</ThemeIcon>
					}
					center>
					<List.Item>Track activities within interactive charts</List.Item>
					<List.Item>Manage todos split into three steps</List.Item>
					<List.Item>Track monthly expenses</List.Item>
				</List>
			</Center>
		</div>
	);
};

export default LoggedOut;
