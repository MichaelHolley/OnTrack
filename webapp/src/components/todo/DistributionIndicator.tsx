import { Tooltip, useMantineColorScheme, useMantineTheme } from '@mantine/core';
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

	const getWidth = (count: number) => {
		return (
			(count /
				(props.open.length +
					props.inProgress.length +
					(props.showComplete ? props.complete.length : 0))) *
			100
		);
	};

	return (
		<div
			style={{
				backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[3],
				padding: 3,
				borderRadius: 5,
				display: 'flex',
			}}>
			<Tooltip
				id="open"
				position="bottom"
				label="Open"
				radius="lg"
				style={{
					width: `${getWidth(props.open.length)}%`,
					marginRight: 5,
				}}>
				<div
					style={{
						backgroundColor: theme.colors.red[8],
						height: 4,
					}}
				/>
			</Tooltip>
			<Tooltip
				id="inProgress"
				position="bottom"
				label="In Progress"
				radius="lg"
				style={{
					width: `${getWidth(props.inProgress.length)}%`,
					marginRight: props.showComplete ? 5 : 0,
				}}>
				<div
					style={{
						backgroundColor: theme.colors.red[6],
						height: 4,
					}}
				/>
			</Tooltip>
			{props.showComplete && (
				<Tooltip
					id="complete"
					position="bottom"
					label="Complete"
					radius="lg"
					style={{
						width: `${getWidth(props.complete.length)}%`,
					}}>
					<div
						style={{
							backgroundColor: theme.colors.red[4],
							height: 4,
						}}
					/>
				</Tooltip>
			)}
		</div>
	);
};

export default DistributionIndicator;
