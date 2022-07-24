import {
	ActionIcon,
	Group,
	Space,
	Switch,
	Table,
	Text,
	useMantineTheme,
} from '@mantine/core';
import { UseListStateHandler } from '@mantine/hooks/lib/use-list-state/use-list-state';
import { useModals } from '@mantine/modals';
import React, { FunctionComponent, useState } from 'react';
import { animated, useTransition } from 'react-spring';
import { ArrowBackUp, Pencil, Trash } from 'tabler-icons-react';
import { Expense, Rythm } from '../../models';
import {
	deleteExpense,
	reactivateExpense,
} from '../../providers/ExpenseService';
import SortableHeader from '../common/SortableHeader';
import SortingIndicator from '../common/SortingIndicator';

interface Props {
	setLoading: (val: boolean) => void;
	data: Expense[];
	dataHandler: UseListStateHandler<Expense>;
	edit: (expense: Expense) => void;
}

type SortProperty = 'title' | 'amount' | 'rythm' | 'created';

const ExpensesTable: FunctionComponent<Props> = (props) => {
	const theme = useMantineTheme();
	const modals = useModals();

	const [showDeleted, setShowDeleted] = useState(false);
	const [initialLoad, setInitialLoad] = useState(true);
	const [sorted, setSorted] = useState<{
		ascending: boolean;
		sortBy: SortProperty;
	}>({
		ascending: true,
		sortBy: 'created',
	});

	const transitions = useTransition(
		props.data.filter((e) => !e.deleted || !!e.deleted === showDeleted),
		{
			from: { x: -100, opacity: 0 },
			enter: (item, index) => (next) =>
				next({ x: 0, opacity: 1, delay: initialLoad ? 100 * (index + 1) : 0 }),
			onRest: () => setInitialLoad(false),
		}
	);

	const deleteConfirmModal = (id: string) =>
		modals.openConfirmModal({
			title: 'Delete expense',
			children: <Text size="sm">This action requires your confirmation.</Text>,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: () => {
				deleteExpense(id).then((resp) => {
					console.log(resp);

					props.dataHandler.setItem(
						props.data.findIndex((e) => e.id === resp.data.id),
						resp.data
					);
				});
			},
		});

	const sortExpenses = (sortBy: SortProperty) => {
		setSorted({
			sortBy: sortBy,
			ascending: !sorted.ascending,
		});

		let sortedRes: Expense[] = props.data.slice(0);
		switch (sortBy) {
			case 'title':
				sortedRes = sortedRes.sort((a, b) =>
					sorted.ascending
						? b.title.localeCompare(a.title)
						: a.title.localeCompare(b.title)
				);
				break;
			case 'amount':
				sortedRes = sortedRes.sort((a, b) =>
					sorted.ascending ? b.amount - a.amount : a.amount - b.amount
				);
				break;
			case 'rythm':
				sortedRes = sortedRes.sort((a, b) =>
					sorted.ascending ? b.rythm - a.rythm : a.rythm - b.rythm
				);
				break;
			case 'created':
				sortedRes = sortedRes.sort((a, b) =>
					sorted.ascending
						? new Date(b.created).getTime() - new Date(a.created).getTime()
						: new Date(a.created).getTime() - new Date(b.created).getTime()
				);
				break;
		}

		props.dataHandler.setState(sortedRes);
	};

	return (
		<div>
			<Switch
				label="Include Deleted"
				checked={showDeleted}
				onChange={(event) => setShowDeleted(event.currentTarget.checked)}
			/>
			<Space h={'md'} />
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
						<SortableHeader
							title="Title"
							sortParam="title"
							currentSorting={sorted}
							sortItems={() => sortExpenses('title')}
						/>
						<SortableHeader
							title="Amount"
							sortParam="amount"
							currentSorting={sorted}
							sortItems={() => sortExpenses('amount')}
						/>
						<SortableHeader
							title="Rythm"
							sortParam="rythm"
							currentSorting={sorted}
							sortItems={() => sortExpenses('rythm')}
						/>
						<SortableHeader
							title="Created"
							sortParam="created"
							currentSorting={sorted}
							sortItems={() => sortExpenses('created')}
						/>
						{showDeleted && <th>Deleted</th>}
						<th></th>
					</tr>
				</thead>
				<tbody>
					{transitions(
						(style, item) =>
							(!item.deleted || !!item.deleted === showDeleted) && (
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
									<td>{new Date(item.created).toLocaleDateString('en-EN')}</td>
									{showDeleted &&
										(!item.deleted ? (
											<td></td>
										) : (
											<td>
												{new Date(item.deleted).toLocaleDateString('en-EN')}
											</td>
										))}
									<td>
										<Group position="right" direction="row" noWrap>
											<ActionIcon
												onClick={() => {
													props.edit(item);
												}}
												disabled={!!item.deleted}>
												<Pencil />
											</ActionIcon>
											<ActionIcon
												onClick={() => {
													if (!item.deleted) {
														deleteConfirmModal(item.id);
													} else {
														reactivateExpense(item.id).then((resp) =>
															props.dataHandler.setItem(
																props.data.findIndex(
																	(e) => e.id === resp.data.id
																),
																resp.data
															)
														);
													}
												}}>
												{item.deleted ? <ArrowBackUp /> : <Trash />}
											</ActionIcon>
										</Group>
									</td>
								</animated.tr>
							)
					)}
				</tbody>
			</Table>
		</div>
	);
};

export default ExpensesTable;
