import {
	Button,
	ColorInput,
	Divider,
	Group,
	NumberInput,
	Select,
	SimpleGrid,
	Space,
	Stack,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm, useListState } from '@mantine/hooks';
import React, { FunctionComponent, useEffect, useState } from 'react';
import ExpensesAverageSummary from '../components/expenses/ExpensesAverageSummary';
import ExpensesSummary from '../components/expenses/ExpensesSummary';
import ExpensesTable from '../components/expenses/ExpensesTable';
import { Expense } from '../models';
import {
	createOrUpdateExpense,
	getExpenses,
} from '../providers/ExpenseService';

const DEFAULT_COLOR = '#fa5252';

interface Props {
	setLoading: (val: boolean) => void;
}

const Expenses: FunctionComponent<Props> = (props) => {
	const [expenses, expensesHandler] = useListState<Expense>();

	const [editId, setEditId] = useState<string>();
	const [formColor, setFormColor] = useState(DEFAULT_COLOR);
	const [formRythm, setFormRythm] = useState<string>('3');

	const loadData = () => {
		expensesHandler.setState([]);
		props.setLoading(true);
		getExpenses()
			.then((res) => {
				expensesHandler.setState(res.data);
				props.setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				props.setLoading(false);
			});
	};

	useEffect(() => {
		document.title = 'OnTrack | Expenses';
		loadData();
	}, []);

	const resetForm = () => {
		createForm.reset();
		setEditId(undefined);
		setFormColor(DEFAULT_COLOR);
		setFormRythm('3');
	};

	const createForm = useForm({
		initialValues: {
			title: '',
			amount: 0.0,
		},
	});

	const editExpense = (expense: Expense) => {
		resetForm();

		createForm.setValues({ title: expense.title, amount: expense.amount });
		setEditId(expense.id);
		setFormColor(expense.color);
		setFormRythm(String(expense.rythm));
	};

	return (
		<>
			<Title>Monthly Expenses</Title>
			<Space h={'lg'} />
			<form
				onSubmit={createForm.onSubmit((values) => {
					props.setLoading(true);

					createOrUpdateExpense({
						id: editId,
						title: values.title,
						rythm: parseInt(formRythm),
						amount: values.amount,
						color: formColor,
					})
						.then((response) => {
							if (editId) {
								expensesHandler.setItem(
									expenses.findIndex((e) => e.id === editId),
									response.data
								);
							} else {
								expensesHandler.append(response.data);
							}
							props.setLoading(false);
							resetForm();
						})
						.catch((err) => {
							console.error(err);
							props.setLoading(false);
						});
				})}>
				<SimpleGrid
					cols={2}
					spacing={'md'}
					breakpoints={[{ maxWidth: 950, cols: 1 }]}>
					<Stack>
						<TextInput
							required
							label="Title"
							placeholder="Enter a title"
							{...createForm.getInputProps('title')}
						/>
						<Select
							required
							label="Ryhtm"
							placeholder="Repeating..."
							data={[
								{ value: '1', label: 'Daily' },
								{ value: '2', label: 'Weekly' },
								{ value: '3', label: 'Monthly' },
								{ value: '4', label: 'Quarterly' },
								{ value: '5', label: 'Half-yearly' },
								{ value: '6', label: 'Yearly' },
							]}
							value={formRythm}
							onChange={(val) => {
								if (val) setFormRythm(val);
							}}
						/>
					</Stack>
					<Stack>
						<NumberInput
							required
							label="Amount"
							placeholder="Enter the amount"
							precision={2}
							step={0.01}
							min={0}
							{...createForm.getInputProps('amount')}
						/>
						<ColorInput
							label="Color"
							value={formColor}
							onChange={setFormColor}
						/>
					</Stack>
				</SimpleGrid>
				<Space h={'lg'} />
				<Group position="right">
					<Button type="submit" variant='light'>Save</Button>
				</Group>
			</form>
			<Space h={'lg'} />
			<ExpensesTable
				setLoading={props.setLoading}
				data={expenses}
				dataHandler={expensesHandler}
				edit={editExpense}
			/>
			<Space h={'lg'} />
			<Divider label={<Title order={2}>Sum</Title>} />
			<ExpensesSummary expenses={expenses.filter((e) => !e.deleted)} />
			<Space h={'lg'} />
			<Divider label={<Title order={2}>Average</Title>} />
			<ExpensesAverageSummary expenses={expenses.filter((e) => !e.deleted)} />
		</>
	);
};

export default Expenses;
