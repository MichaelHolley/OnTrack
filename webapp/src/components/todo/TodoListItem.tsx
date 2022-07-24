import { ActionIcon, Group, Text } from '@mantine/core';
import { UseListStateHandler } from '@mantine/hooks/lib/use-list-state/use-list-state';
import { useModals } from '@mantine/modals';
import React, { FunctionComponent } from 'react';
import { ArrowRight, Check, Trash } from 'tabler-icons-react';
import { TodoItem, TodoState } from '../../models';
import { createOrUpdateTodo, deleteTodo } from '../../providers/TodosService';

interface Props {
	todoItem: TodoItem;
	items: TodoItem[];
	listHandler: UseListStateHandler<TodoItem>;
	nextStateHandler?: UseListStateHandler<TodoItem>;
}

const TodoListItem: FunctionComponent<Props> = (props) => {
	const modals = useModals();

	const removeItemFromList = () => {
		props.listHandler.remove(
			props.items.findIndex((t) => t.id === props.todoItem.id)
		);
	};

	const deleteConfirmModal = () =>
		modals.openConfirmModal({
			title: 'Delete todo-item',
			children: <Text size="sm">This action requires your confirmation and can not be undone.</Text>,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onCancel: () => {
				return;
			},
			onConfirm: () => {
				deleteTodo(props.todoItem.id).then(() => {
					removeItemFromList();
				});
			},
		});

	return (
		<Group position="apart" direction="row" noWrap>
			<Text style={{ padding: 8 }}>{props.todoItem.title}</Text>
			<Group
				style={{ paddingLeft: 8, paddingRight: 24 }}
				direction="row"
				noWrap>
				<ActionIcon onClick={deleteConfirmModal} title="Delete">
					<Trash />
				</ActionIcon>
				{props.todoItem.state !== TodoState.Complete && (
					<ActionIcon
						onClick={() => {
							createOrUpdateTodo({
								id: props.todoItem.id,
								state: props.todoItem.state + 1,
								title: props.todoItem.title,
							}).then((res) => {
								removeItemFromList();
								if (props.nextStateHandler) {
									props.nextStateHandler.append(res.data);
								}
							});
						}}
						title={
							props.todoItem.state === TodoState.Open
								? 'Set in progress'
								: 'Complete'
						}>
						{props.todoItem.state === TodoState.Open ? (
							<ArrowRight />
						) : (
							<Check />
						)}
					</ActionIcon>
				)}
			</Group>
		</Group>
	);
};

export default TodoListItem;
