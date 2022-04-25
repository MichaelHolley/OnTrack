import { Divider, Space, Title } from '@mantine/core';
import React, { ReactElement } from 'react';

export const TitleDivider = (props: { title: string; icon: ReactElement }) => {
	return (
		<Divider
			labelPosition="left"
			label={
				<>
					<Title order={2}>{props.title}</Title>
					<Space w={12} />
					{props.icon}
				</>
			}
		/>
	);
};
