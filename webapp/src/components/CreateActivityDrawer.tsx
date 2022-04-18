import { Button, Drawer, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import React from 'react';
import { createActivity } from '../providers/ActivitiesService';

interface Props {
	showDrawer: boolean;
	setShowDrawer: (show: boolean) => void;
	setLoading: (loading: boolean) => void;
	onSuccess: () => void;
}

export const CreateActivityDrawer = (props: Props) => {
	const createForm = useForm({
		initialValues: {
			title: '',
		},
	});

	return (
		<Drawer
			opened={props.showDrawer}
			onClose={() => {
				props.setShowDrawer(false);
			}}
			title="Create activity"
			position="right"
			size="xl"
			padding={'lg'}>
			<form
				onSubmit={createForm.onSubmit((values) => {
					props.setLoading(true);
					createActivity(values)
						.then(() => {
							props.setShowDrawer(false);
							props.setLoading(false);
							props.onSuccess();
							createForm.reset();
						})
						.catch((err) => {
							console.error(err);
							props.setLoading(false);
						});
				})}>
				<TextInput
					required
					label="Title"
					placeholder="Enter a title"
					{...createForm.getInputProps('title')}
				/>
				<Group position="right" mt="md">
					<Button type="submit" variant="light">
						Save
					</Button>
				</Group>
			</form>
		</Drawer>
	);
};
