import {
	ActionIcon,
	Button,
	Card,
	Divider,
	Group,
	Modal,
	NumberInput,
	Space,
	Text,
	TextInput,
	Title,
	useMantineColorScheme,
	useMantineTheme,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useModals } from '@mantine/modals';
import React, { FunctionComponent, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { CirclePlus, Trash } from 'tabler-icons-react';
import { Activity, ActivityValue } from '../../models';
import {
	deleteActivity,
	deleteActivityValue,
	updateActivitiyValue,
} from '../../providers/ActivitiesService';

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

	const [editValue, setEditValue] = useState<ActivityValue>();
	const [editValueDate, setEditValueDate] = useState<Date | null>();
	const [editValueValue, setEditValueValue] = useState<number>();

	const deleteConfirmModal = () =>
		modals.openConfirmModal({
			title: 'Delete activity',
			children: <Text size="sm">This action requires your confirmation.</Text>,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onCancel: () => {
				resetEditActivityModal();
			},
			onConfirm: () => {
				deleteActivity(props.activity.id).then(() => props.onSuccess());
			},
		});

	const showEditActivityModal = (val: ActivityValue) => {
		setEditValue({
			date: new Date(val.date),
			value: val.value,
		});

		setEditValueDate(new Date(val.date));
		setEditValueValue(val.value);
	};

	const resetEditActivityModal = () => {
		setEditValue(undefined);
		setEditValueDate(undefined);
		setEditValueValue(undefined);
	};

	return (
		<Card shadow={'md'} key={props.activity.title}>
			<Modal
				opened={!!editValue}
				onClose={() => setEditValue(undefined)}
				title="Edit value">
				<TextInput
					value={props.activity.id}
					disabled
					rightSection={
						<ActionIcon
							size={'lg'}
							variant="light"
							color="red"
							onClick={() => {
								if (editValue != undefined) {
									deleteActivityValue(
										props.activity.id,
										editValue.date,
										editValue.value
									).then(() => {
										resetEditActivityModal();
										props.onSuccess();
									});
								}
							}}
							title="Delete value">
							<Trash />
						</ActionIcon>
					}
					rightSectionWidth={50}
					rightSectionProps={{
						style: { justifyContent: 'end' },
					}}></TextInput>
				<Divider style={{ marginTop: 10, marginBottom: 10 }} />
				<DatePicker
					required
					label="Date"
					value={editValueDate}
					onChange={setEditValueDate}
				/>
				<NumberInput
					required
					label="Value"
					placeholder="Enter the value"
					value={editValueValue}
					onChange={setEditValueValue}
					precision={2}
				/>
				<Space h={'sm'} />
				<Group position="right">
					<Button
						onClick={() => {
							if (!!editValue && !!editValueDate && !!editValueValue) {
								updateActivitiyValue(props.activity.id, editValue, {
									date: editValueDate,
									value: editValueValue,
								}).then(() => {
									resetEditActivityModal();
									props.onSuccess();
								});
							}
						}}>
						Save
					</Button>
				</Group>
			</Modal>
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
							events: {
								markerClick: (e, chart, { dataPointIndex }) => {
									showEditActivityModal(props.activity.values[dataPointIndex]);
								},
							},
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
