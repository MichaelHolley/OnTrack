import {
	ActionIcon,
	Card,
	Group,
	Text,
	Title,
	useMantineColorScheme,
	useMantineTheme,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import React, { FunctionComponent } from 'react';
import ReactApexChart from 'react-apexcharts';
import { CirclePlus, Trash } from 'tabler-icons-react';
import { Activity } from '../../models';
import { deleteActivity } from '../../providers/ActivitiesService';

interface Props {
	activity: Activity;
	openForm: (id: string) => void;
	onSuccess: () => void;
}

export const ActivityCard: FunctionComponent<Props> = (props) => {
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	const modals = useModals();
	const theme = useMantineTheme();

	const deleteConfirmModal = () =>
		modals.openConfirmModal({
			title: 'Delete activity',
			children: <Text size="sm">This action requires your confirmation.</Text>,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onCancel: () => {
				return;
			},
			onConfirm: () => {
				deleteActivity(props.activity.id).then(() => props.onSuccess());
			},
		});

	return (
		<Card shadow={'md'} key={props.activity.title}>
			<Card.Section>
				<ReactApexChart
					series={[
						{
							name: props.activity.title,
							data: props.activity.values.map((val) => val.value),
							color: theme.colors.red[5],
						},
					]}
					options={{
						chart: {
							type: 'area',
							background: 'transparent',
							toolbar: {
								show: false,
							},
							zoom: { autoScaleYaxis: true },
						},
						dataLabels: { enabled: true },
						theme: {
							mode: isDark ? 'dark' : 'light',
						},
						xaxis: {
							categories: props.activity.values.map((a) =>
								new Date(a.date).getTime()
							),
							type: 'datetime',
						},
						tooltip: {
							x: {
								format: 'dd MMM yyyy',
							},
						},
						yaxis: {
							min: 0,
						},
						fill: {
							type: 'gradient',
						},
					}}
					type="area"
					height={260}
				/>
			</Card.Section>
			<Group position="apart">
				<Group position="left">
					<Title order={3}>{props.activity.title}</Title>
					<ActionIcon onClick={() => deleteConfirmModal()}>
						<Trash />
					</ActionIcon>
				</Group>
				<ActionIcon onClick={() => props.openForm(props.activity.id)}>
					<CirclePlus />
				</ActionIcon>
			</Group>
		</Card>
	);
};
