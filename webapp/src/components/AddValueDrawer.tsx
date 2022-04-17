import { Button, Drawer, Group, NumberInput, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import React, { useState } from 'react';
import { Activity } from '../../models';
import { addValue } from '../providers/ActivitiesService';

interface Props {
	showDrawer: boolean;
	setShowDrawer: (show: boolean) => void;
	setLoading: (loading: boolean) => void;
	selectedActivity: Activity | undefined;
	onSuccess: () => void;
}

export function AddValueDrawer(props: Props) {
	const [selectedDate, setSelectedDate] = useState<Date | null>();

	const addValueForm = useForm({
		initialValues: {
			value: 0,
		},
	});

	return (
		<Drawer
			opened={props.showDrawer}
			onClose={() => {
				props.setShowDrawer(false);
			}}
			title="Add value"
			position="right"
			size="md"
			padding={'lg'}>
			<form
				onSubmit={addValueForm.onSubmit((values) => {
					if (!!props.selectedActivity && !!selectedDate) {
						props.setLoading(true);
						addValue(props.selectedActivity.id, {
							date: selectedDate,
							value: values.value,
						})
							.then(() => {
								addValueForm.reset();
								props.setLoading(false);
								props.setShowDrawer(false);
								props.onSuccess();
							})
							.catch((err) => {
								console.error(err);
								props.setLoading(false);
							});
					}
				})}>
				<TextInput label="ID" value={props.selectedActivity?.id} disabled />
				<DatePicker
					required
					label="Date"
					value={selectedDate}
					onChange={setSelectedDate}
				/>
				<NumberInput
					required
					label="Value"
					placeholder="Enter the value"
					{...addValueForm.getInputProps('value')}
				/>
				<Group position="right" mt="md">
					<Button type="submit" variant="light">
						Save
					</Button>
				</Group>
			</form>
		</Drawer>
	);
}
