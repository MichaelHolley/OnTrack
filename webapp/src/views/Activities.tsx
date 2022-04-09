import { SimpleGrid, Space, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Activity } from '../../models';
import { getActivities } from '../providers/ActivitiesService';
import { ActivityCard } from '../components/ActivityCard';

interface Props {
	setLoading: (val: boolean) => void;
}

const Activities = (props: Props) => {
	const [activities, setActivities] = useState<Activity[]>([]);

	useEffect(() => {
		props.setLoading(true);
		getActivities()
			.then((res) => {
				setActivities(res.data);
				props.setLoading(false);
			})
			.catch((err) => {
				props.setLoading(false);
			});
	}, []);

	return (
		<>
			<Title>Activities</Title>
			<Space h={40} />
			<SimpleGrid
				cols={3}
				spacing={'md'}
				breakpoints={[
					{ maxWidth: 1400, cols: 2 },
					{ maxWidth: 950, cols: 1 },
				]}>
				{activities.map((activity, index) => {
					return <ActivityCard activity={activity} />;
				})}
			</SimpleGrid>
		</>
	);
};

export default Activities;
