import {
	Group,
	SimpleGrid,
	Space,
	Title,
	useMantineColorScheme,
	useMantineTheme,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import React, { FunctionComponent, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Check, ClearAll, Run } from 'tabler-icons-react';
import { TitleDivider } from '../components/common/TitleDivider';
import DistributionIndicator from '../components/todo/DistributionIndicator';
import TodoList from '../components/todo/TodoList';
import { TodoItem, TodoState } from '../models';
import { getTodos } from '../providers/TodosService';

interface Props {
	setLoading: (val: boolean) => void;
	showComplete?: boolean;
	flatDistributionIndicator?: boolean;
}

const Todo: FunctionComponent<Props> = (props) => {
	const [open, openHandlers] = useListState<TodoItem>();
	const [inProgress, inProgressHandlers] = useListState<TodoItem>();
	const [complete, completeHandlers] = useListState<TodoItem>();

	const theme = useMantineTheme();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	const loadData = () => {
		props.setLoading(true);
		getTodos()
			.then((res) => {
				res.data = res.data.filter((a) => !a.deleted);

				openHandlers.setState(
					res.data.filter((t) => t.state === TodoState.Open)
				);

				inProgressHandlers.setState(
					res.data.filter((t) => t.state === TodoState.InProgress)
				);

				completeHandlers.setState(
					res.data.filter((t) => t.state === TodoState.Complete)
				);

				props.setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				props.setLoading(false);
			});
	};

	useEffect(() => {
		document.title = "OnTrack | Todo"
		loadData();
	}, []);

	return (
		<>
			<Title>ToDo</Title>
			<Space h={'lg'} />

			{props.flatDistributionIndicator && (
				<DistributionIndicator
					open={open}
					inProgress={inProgress}
					complete={complete}
					showComplete={!!props.showComplete}
				/>
			)}

			<SimpleGrid
				cols={2}
				spacing={'md'}
				breakpoints={[{ maxWidth: 1200, cols: 1 }]}>
				<Group direction="column" grow>
					<TitleDivider title="Open" icon={<ClearAll />} />
					<TodoList
						items={open}
						height={210}
						state={TodoState.Open}
						listHandler={openHandlers}
						nextStateHandler={inProgressHandlers}
					/>
				</Group>
				<Group direction="column" grow>
					<TitleDivider title="In Progress" icon={<Run />} />
					<TodoList
						items={inProgress}
						height={210}
						state={TodoState.InProgress}
						listHandler={inProgressHandlers}
						nextStateHandler={completeHandlers}
					/>
				</Group>
				{props.showComplete && (
					<>
						<Group direction="column" grow>
							<TitleDivider title="Complete" icon={<Check />} />
							<TodoList
								items={complete}
								height={210}
								state={TodoState.Complete}
								listHandler={completeHandlers}
							/>
						</Group>
						<Group
							direction="column"
							position="center"
							style={{ display: 'flex', alignItems: 'center' }}>
							<div style={{ margin: 'auto 0' }}>
								<ReactApexChart
									series={[
										open !== undefined ? open.length : 0,
										inProgress !== undefined ? inProgress.length : 0,
										complete !== undefined ? complete.length : 0,
									]}
									options={{
										chart: {
											type: 'donut',
										},
										stroke: {
											width: 0,
										},
										dataLabels: {
											style: {
												colors: [
													isDark ? theme.colors.red[0] : theme.colors.dark[9],
												],
												fontSize: '14',
												fontFamily: theme.fn.fontStyles().fontFamily,
											},
											dropShadow: { enabled: false },
										},
										labels: ['Open', 'InProgress', 'Complete'],
										colors: [
											theme.colors.red[8],
											theme.colors.red[6],
											theme.colors.red[4],
										],
										legend: {
											labels: {
												colors: isDark
													? theme.colors.dark[0]
													: theme.colors.dark[9],
											},
											fontSize: '14',
											fontFamily: theme.fn.fontStyles().fontFamily,
										},
									}}
									type="donut"
								/>
							</div>
						</Group>
					</>
				)}
			</SimpleGrid>
		</>
	);
};

export default Todo;
