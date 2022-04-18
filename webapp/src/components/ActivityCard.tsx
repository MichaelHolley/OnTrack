import {
	ActionIcon,
	Card,
	Group,
	Title,
	useMantineColorScheme
} from '@mantine/core';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { CirclePlus } from 'tabler-icons-react';
import { Activity } from '../../models';

interface Props {
	activity: Activity;
	openForm: (id: string) => void;
}

export const ActivityCard = (props: Props) => {
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<Card shadow={'md'} key={props.activity.title}>
			<Card.Section>
				<ReactApexChart
					series={[
						{
							data: props.activity.values.map((val) => val.value),
						},
					]}
					options={{
						chart: {
							background: 'transparent',
							toolbar: {
								show: false,
							},
						},
						theme: {
							mode: isDark ? 'dark' : 'light',
						},
						xaxis: {
							categories: props.activity.values.map((a) =>
								new Date(a.date).toLocaleDateString(undefined, {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
								})
							),
						},
						yaxis: {
							min: 0,
						},
					}}
					type="line"
					height={260}
				/>
			</Card.Section>
			<Group position="apart">
				<Title order={3}>{props.activity.title}</Title>
				<ActionIcon onClick={() => props.openForm(props.activity.id)}>
					<CirclePlus />
				</ActionIcon>
			</Group>
		</Card>
	);
};
