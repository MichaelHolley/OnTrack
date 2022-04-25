import { Group, Space, Title } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import React, { useEffect } from 'react';
import { Check, ClearAll, Run } from 'tabler-icons-react';
import { TitleDivider } from '../components/common/TitleDivider';
import TodoList from '../components/todo/TodoList';
import { TodoItem, TodoState } from '../models';
import { getTodos } from '../providers/TodosService';

interface Props {
	setLoading: (val: boolean) => void;
}

const Todo = (props: Props) => {
	const [open, openHandlers] = useListState<TodoItem>();
	const [inProgress, inProgressHandlers] = useListState<TodoItem>();
	const [complete, completeHandlers] = useListState<TodoItem>();

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
		loadData();
	}, []);

	return (
		<>
			<Group position="left">
				<Title>ToDo</Title>
			</Group>
			<Space h={'lg'} />
			<TitleDivider title="Open" icon={<ClearAll />} />
			<TodoList
				items={open}
				height={210}
				state={TodoState.Open}
				listHandler={openHandlers}
				nextStateHandler={inProgressHandlers}
			/>
			<Space h={'lg'} />
			<TitleDivider title="In Progress" icon={<Run />} />
			<TodoList
				items={inProgress}
				height={210}
				state={TodoState.InProgress}
				listHandler={inProgressHandlers}
				nextStateHandler={completeHandlers}
			/>
			<Space h={'lg'} />
			<TitleDivider title="Complete" icon={<Check />} />
			<TodoList
				items={complete}
				height={210}
				state={TodoState.Complete}
				listHandler={completeHandlers}
			/>
		</>
	);
};

export default Todo;
