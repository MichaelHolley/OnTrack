import {
	ActionIcon, Group, Paper,
	ScrollArea,
	Space,
	Text,
	TextInput,
	Title
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { UseListStateHandler } from '@mantine/hooks/lib/use-list-state/use-list-state';
import React, { useEffect, useState } from 'react';
import { Check, ClearAll, Plus, Run } from 'tabler-icons-react';
import { TitleDivider } from '../components/TitleDivider';
import { TodoItem, TodoState } from '../models';
import { createOrUpdateTodo, getTodos } from '../providers/TodosService';

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
			/>
			<Space h={'lg'} />
			<TitleDivider title="In Progress" icon={<Run />} />
			<TodoList
				items={inProgress}
				height={210}
				state={TodoState.InProgress}
				listHandler={inProgressHandlers}
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

export const TodoList = (props: {
	items: TodoItem[];
	state: TodoState;
	height: number;
	listHandler: UseListStateHandler<TodoItem>;
}) => {
	const [addInput, setAddInput] = useState('');

	return (
		<Paper>
			<ScrollArea style={{ height: props.height }}>
				{props.items.map((item) => TodoListItem({ todoItem: item }))}
			</ScrollArea>
			<TextInput
				placeholder="Enter a task-description"
				required
				value={addInput}
				onChange={(event) => setAddInput(event.currentTarget.value)}
				rightSection={
					<ActionIcon
						onClick={() => {
							if (!!addInput && addInput !== '') {
								createOrUpdateTodo({
									title: addInput,
									state: props.state,
								}).then((res) => {
									setAddInput('');
									props.listHandler.append(res.data);
								});
							}
						}}
						title="Add todo">
						<Plus />
					</ActionIcon>
				}
				rightSectionWidth={50}
				rightSectionProps={{
					style: { paddingRight: 4, justifyContent: 'end' },
				}}></TextInput>
		</Paper>
	);
};

export const TodoListItem = (props: { todoItem: TodoItem }) => {
	return <Text style={{ padding: 8 }}>{props.todoItem.title}</Text>;
};

export default Todo;
