import { ActionIcon, Paper, ScrollArea, TextInput } from '@mantine/core';
import { UseListStateHandler } from '@mantine/hooks/lib/use-list-state/use-list-state';
import React, { useState } from 'react';
import { Plus } from 'tabler-icons-react';
import { TodoItem, TodoState } from '../../models';
import { createOrUpdateTodo } from '../../providers/TodosService';
import TodoListItem from './TodoListItem';

const TodoList = (props: {
	items: TodoItem[];
	state: TodoState;
	height: number;
	listHandler: UseListStateHandler<TodoItem>;
	nextStateHandler?: UseListStateHandler<TodoItem>;
}) => {
	const [addInput, setAddInput] = useState('');

	const addAction = () => {
		if (!!addInput && addInput !== '') {
			createOrUpdateTodo({
				title: addInput,
				state: props.state,
			}).then((res) => {
				setAddInput('');
				props.listHandler.append(res.data);
			});
		}
	};

	return (
		<Paper>
			<ScrollArea style={{ height: props.height }}>
				{props.items.map((item) =>
					TodoListItem({
						todoItem: item,
						items: props.items,
						listHandler: props.listHandler,
						nextStateHandler: props.nextStateHandler,
					})
				)}
			</ScrollArea>
			<TextInput
				placeholder="Enter a task-description"
				required
				value={addInput}
				onChange={(event) => setAddInput(event.currentTarget.value)}
				rightSection={
					<ActionIcon onClick={addAction} title="Add todo">
						<Plus />
					</ActionIcon>
				}
				rightSectionWidth={50}
				rightSectionProps={{
					style: { paddingRight: 4, justifyContent: 'end' },
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						addAction();
					}
				}}></TextInput>
		</Paper>
	);
};

export default TodoList;
