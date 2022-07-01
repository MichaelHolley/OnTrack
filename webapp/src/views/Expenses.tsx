import {
	Button,
	ColorInput,
	Group,
	NumberInput,
	Select,
	SimpleGrid,
	Space,
	Stack,
	TextInput,
	Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm, useListState } from '@mantine/hooks';
import React, { FunctionComponent, useEffect, useState } from 'react';
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
	const [formStartDate, setFormStartDate] = useState<Date | null>();
	const [formEndDate, setFormEndDate] = useState<Date | null>();

	const loadData = () => {
		expensesHandler.setState([]);
		props.setLoading(true);
		getExpenses()
			.then((res) => {
				expensesHandler.setState(res.data.filter((e) => !e.deleted));
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

	const resetForm = () => {
		createForm.reset();
		setEditId(undefined);
		setFormColor(DEFAULT_COLOR);
		setFormRythm('3');
		setFormStartDate(null);
		setFormEndDate(null);
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
		setFormStartDate(new Date(expense.startDate));
		setFormEndDate(expense.endDate ? new Date(expense.endDate) : null);
	};

	return (
		<>
			<Title>Monthly Expenses</Title>
			<Space h={'lg'} />
			<form
				onSubmit={createForm.onSubmit((values) => {
					props.setLoading(true);

					if (formStartDate) {
						createOrUpdateExpense({
							id: editId,
							title: values.title,
							rythm: parseInt(formRythm),
							amount: values.amount,
							color: formColor,
							startDate: formStartDate,
							endDate: formEndDate ?? undefined,
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
					} else {
						props.setLoading(false);
					}
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
						<NumberInput
							required
							label="Amount"
							placeholder="Enter the amount"
							precision={2}
							step={0.01}
							min={0}
							{...createForm.getInputProps('amount')}
						/>
					</Stack>
					<Stack>
						<DatePicker
							required
							label="Start-Date"
							placeholder="Start of the payment"
							value={formStartDate}
							onChange={setFormStartDate}
						/>
						<DatePicker
							label="End-Date"
							placeholder="End of the payment"
							value={formEndDate}
							onChange={setFormEndDate}
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
					<Button type="submit">Save</Button>
				</Group>
			</form>
			<Space h={'lg'} />
			<ExpensesTable
				setLoading={props.setLoading}
				data={expenses}
				dataHandler={expensesHandler}
				edit={editExpense}
			/>
		</>
	);
};

export default Expenses;
