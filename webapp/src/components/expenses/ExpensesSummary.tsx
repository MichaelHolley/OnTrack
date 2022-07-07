import { Expense, Rythm } from '../../models';
import React, { FunctionComponent } from 'react';
import { Table, Tooltip } from '@mantine/core';

interface Props {
	expenses: Expense[];
}

const ExpensesSummary: FunctionComponent<Props> = (props) => {
	const sumExpensesByRythm = (rythm: Rythm, multiplier = 1) => {
		return (
			props.expenses
				.filter((e) => e.rythm === rythm)
				.reduce((prev, next) => prev + next.amount, 0) * multiplier
		);
	};

	return (
		<Table highlightOnHover>
			<thead>
				<tr>
					<th>
						<Tooltip
							transition="slide-up"
							label="Sum of daily and weekly expenses">
							Daily + Weekly
						</Tooltip>
					</th>
					<th>
						<Tooltip transition="slide-up" label="Sum of monthly expenses">
							Monthly
						</Tooltip>
					</th>
					<th>
						<Tooltip
							transition="slide-up"
							label="Sum of quarterly, half yearly and yearly expenses">
							Quarterly + Half Yearly + Yearly
						</Tooltip>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						{(
							sumExpensesByRythm(Rythm.Daily, 7) +
							sumExpensesByRythm(Rythm.Weekly)
						).toFixed(2)}
					</td>
					<td>{sumExpensesByRythm(Rythm.Monthly).toFixed(2)}</td>
					<td>
						{(
							sumExpensesByRythm(Rythm.Quarterly, 4) +
							sumExpensesByRythm(Rythm.HalfYearly, 2) +
							sumExpensesByRythm(Rythm.Year)
						).toFixed(2)}
					</td>
				</tr>
			</tbody>
		</Table>
	);
};

export default ExpensesSummary;
