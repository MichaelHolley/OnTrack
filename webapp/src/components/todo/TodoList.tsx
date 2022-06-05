import { ActionIcon, Paper, ScrollArea, TextInput } from '@mantine/core';
import { UseListStateHandler } from '@mantine/hooks/lib/use-list-state/use-list-state';
import React, { FunctionComponent, useState } from 'react';
import { useTransition, animated } from 'react-spring';
import { Plus } from 'tabler-icons-react';
import { TodoItem, TodoState } from '../../models';
import { createOrUpdateTodo } from '../../providers/TodosService';
import TodoListItem from './TodoListItem';

interface Props {
	items: TodoItem[];
	state: TodoState;
	height: number;
	listHandler: UseListStateHandler<TodoItem>;
	nextStateHandler?: UseListStateHandler<TodoItem>;
}

const TodoList: FunctionComponent<Props> = (props) => {
	const [addInput, setAddInput] = useState('');

	const transitions = useTransition(props.items, {
		from: { x: -100, opacity: 0 },
		enter: { x: 0, opacity: 1 },
		leave: { x: 100, opacity: 0 },
	});

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
				{transitions((style, item) => (
					<animated.div style={style}>
						<TodoListItem
							todoItem={item}
							items={props.items}
							listHandler={props.listHandler}
							nextStateHandler={props.nextStateHandler}
						/>
					</animated.div>
				))}
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
