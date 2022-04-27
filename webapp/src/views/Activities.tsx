import { Button, Group, SimpleGrid, Space, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { CirclePlus } from 'tabler-icons-react';
import { Activity } from '../models';
import { ActivityCard } from '../components/activity/ActivityCard';
import { AddValueDrawer } from '../components/activity/AddValueDrawer';
import { CreateActivityDrawer } from '../components/activity/CreateActivityDrawer';
import { getActivities } from '../providers/ActivitiesService';

interface Props {
	setLoading: (val: boolean) => void;
}

const Activities = (props: Props) => {
	const [activities, setActivities] = useState<Activity[]>([]);

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showAddValueForm, setShowAddValueForm] = useState(false);

	const [selectedActivity, setSelectedActivity] = useState<
		Activity | undefined
	>(undefined);

	const loadData = () => {
		props.setLoading(true);
		getActivities()
			.then((res) => {
				res.data = res.data.filter((a) => !a.deleted);
				res.data.forEach((a) =>
					a.values.sort(
						(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
					)
				);
				setActivities(res.data);
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

	return (
		<>
			<Group position="left">
				<Title>Activities</Title>
				<Button
					variant="light"
					leftIcon={<CirclePlus />}
					onClick={() => {
						setShowCreateForm(true);
					}}>
					Create
				</Button>
			</Group>
			<Space h={'lg'} />
			<SimpleGrid
				cols={3}
				spacing={'md'}
				breakpoints={[
					{ maxWidth: 1400, cols: 2 },
					{ maxWidth: 950, cols: 1 },
				]}>
				{activities.map((activity) => {
					return (
						<ActivityCard
							key={activity.title}
							activity={activity}
							openForm={() => {
								setShowAddValueForm(true);
								setSelectedActivity(activity);
							}}
							onSuccess={loadData}
						/>
					);
				})}
			</SimpleGrid>
			<CreateActivityDrawer
				showDrawer={showCreateForm}
				setShowDrawer={setShowCreateForm}
				setLoading={props.setLoading}
				onSuccess={loadData}
			/>
			<AddValueDrawer
				showDrawer={showAddValueForm}
				setShowDrawer={setShowAddValueForm}
				setLoading={props.setLoading}
				selectedActivity={selectedActivity}
				onSuccess={loadData}
			/>
		</>
	);
};

export default Activities;
