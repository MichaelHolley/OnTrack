import { useMantineColorScheme, useMantineTheme } from '@mantine/core';
import React, { FunctionComponent } from 'react';
import { TodoItem } from '../../models';

interface Props {
	open: TodoItem[];
	inProgress: TodoItem[];
	complete: TodoItem[];
	showComplete: boolean;
}

const DistributionIndicator: FunctionComponent<Props> = (props) => {
	const theme = useMantineTheme();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<div
			style={{
				backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[3],
				padding: 3,
				borderRadius: 5,
				display: 'flex',
			}}>
			<div
				id="open"
				style={{
					backgroundColor: theme.colors.red[8],
					height: 4,
					width: `${
						(props.open.length /
							(props.open.length +
								props.inProgress.length +
								(props.showComplete ? props.complete.length : 0))) *
						100
					}%`,
					marginRight: 5,
				}}></div>
			<div
				id="inProgress"
				style={{
					backgroundColor: theme.colors.red[6],
					height: 4,
					width: `${
						(props.inProgress.length /
							(props.open.length +
								props.inProgress.length +
								(props.showComplete ? props.complete.length : 0))) *
						100
					}%`,
					marginRight: props.showComplete ? 5 : 0,
				}}></div>
			{props.showComplete && (
				<div
					id="complete"
					style={{
						backgroundColor: theme.colors.red[4],
						height: 4,
						width: `${
							(props.complete.length /
								(props.open.length +
									props.inProgress.length +
									props.complete.length)) *
							100
						}%`,
					}}></div>
			)}
		</div>
	);
};

export default DistributionIndicator;
