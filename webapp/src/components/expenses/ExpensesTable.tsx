import { ActionIcon, Group, Table, Text, useMantineTheme } from '@mantine/core';
import { UseListStateHandler } from '@mantine/hooks/lib/use-list-state/use-list-state';
import { useModals } from '@mantine/modals';
import React, { FunctionComponent, useState } from 'react';
import { animated, useTransition } from 'react-spring';
import { Pencil, Trash } from 'tabler-icons-react';
import { Expense, Rythm } from '../../models';
import { deleteExpense } from '../../providers/ExpenseService';

interface Props {
	setLoading: (val: boolean) => void;
	data: Expense[];
	dataHandler: UseListStateHandler<Expense>;
	edit: (expense: Expense) => void;
}

const ExpensesTable: FunctionComponent<Props> = (props) => {
	const theme = useMantineTheme();
	const modals = useModals();

	const [initialLoad, setInitialLoad] = useState(true);

	const transitions = useTransition(props.data, {
		from: { x: -100, opacity: 0 },
		enter: (item, index) => (next) =>
			next({ x: 0, opacity: 1, delay: initialLoad ? 100 * (index + 1) : 0 }),
		onRest: () => setInitialLoad(false),
	});

	const deleteConfirmModal = (id: string) =>
		modals.openConfirmModal({
			title: 'Delete expense',
			children: <Text size="sm">This action requires your confirmation.</Text>,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: () => {
				deleteExpense(id).then(() =>
					props.dataHandler.remove(props.data.findIndex((e) => e.id === id))
				);
			},
		});

	return (
		<Table
			highlightOnHover
			style={{
				backgroundColor:
					theme.colorScheme === 'dark'
						? theme.colors.dark[7]
						: theme.colors.gray[0],
			}}>
			<thead>
				<tr>
					<th>Title</th>
					<th>Amount</th>
					<th>Rythm</th>
					<th>Start</th>
					<th>End</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{transitions((style, item) => (
					<animated.tr style={style}>
						<td
							style={{
								borderLeftStyle: 'solid',
								borderLeftColor: item.color,
							}}>
							{item.title}
						</td>
						<td>{item.amount}</td>
						<td>{Rythm[item.rythm]}</td>
						<td>{new Date(item.startDate).toLocaleDateString('en-EN')}</td>
						<td>
							{item.endDate
								? new Date(item.endDate).toLocaleDateString('en-EN')
								: undefined}
						</td>
						<td>
							<Group position="right" direction="row" noWrap>
								<ActionIcon
									onClick={() => {
										props.edit(item);
									}}>
									<Pencil />
								</ActionIcon>
								<ActionIcon
									onClick={() => {
										deleteConfirmModal(item.id);
									}}>
									<Trash />
								</ActionIcon>
							</Group>
						</td>
					</animated.tr>
				))}
			</tbody>
		</Table>
	);
};

export default ExpensesTable;
