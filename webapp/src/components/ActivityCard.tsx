import { Card, Title, useMantineColorScheme } from '@mantine/core';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Activity } from '../../models';

interface Props {
	activity: Activity;
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
							categories: props.activity.values.map((val) => val.date),
						},
					}}
					type="line"
					height={260}
				/>
			</Card.Section>
			<Title order={3}>{props.activity.title}</Title>
		</Card>
	);
};
