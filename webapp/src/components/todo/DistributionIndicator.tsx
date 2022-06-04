import {
	createStyles,
	Tooltip,
	useMantineColorScheme,
	useMantineTheme
} from '@mantine/core';
import React, { FunctionComponent } from 'react';
import { TodoItem } from '../../models';

interface Props {
	open: TodoItem[];
	inProgress: TodoItem[];
	complete: TodoItem[];
	showComplete: boolean;
}

const useStyles = createStyles((theme, _params, getRef) => {
	return {
		indicator: {
			height: 4,
			borderRadius: 5,
		},
	};
});

const DistributionIndicator: FunctionComponent<Props> = (props) => {
	const theme = useMantineTheme();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';
	const { classes } = useStyles();

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
				padding: 2,
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
					marginRight: 3,
				}}>
				<div
					className={classes.indicator}
					style={{
						backgroundColor: theme.colors.red[8],
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
					marginRight: props.showComplete ? 3 : 0,
				}}>
				<div
					className={classes.indicator}
					style={{
						backgroundColor: theme.colors.red[6],
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
						className={classes.indicator}
						style={{
							backgroundColor: theme.colors.red[4],
						}}
					/>
				</Tooltip>
			)}
		</div>
	);
};

export default DistributionIndicator;
