import { Table } from '@mantine/core';
import React, { FunctionComponent } from 'react';
import { Expense } from '../../models';
import { expenseToDaily, expenseToMonthly, expenseToYearly } from './util';

interface Props {
	expenses: Expense[];
}

const ExpensesAverageSummary: FunctionComponent<Props> = (props) => {
	return (
		<Table highlightOnHover>
			<thead>
				<tr>
					<th>Daily</th>
					<th>Monthly</th>
					<th>Yearly</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						{props.expenses
							.reduce((prev, next) => prev + expenseToDaily(next), 0)
							.toFixed(2)}
					</td>
					<td>
						{props.expenses
							.reduce((prev, next) => prev + expenseToMonthly(next), 0)
							.toFixed(2)}
					</td>
					<td>
						{props.expenses
							.reduce((prev, next) => prev + expenseToYearly(next), 0)
							.toFixed(2)}
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default ExpensesAverageSummary;
