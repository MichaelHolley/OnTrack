import { Space } from '@mantine/core';
import React, { FunctionComponent, useEffect } from 'react';
import Activities from './Activities';
import Todo from './Todo';

interface Props {
	setLoading: (val: boolean) => void;
}

const Home: FunctionComponent<Props> = (props) => {
	useEffect(() => {
		document.title = "OnTrack | Home"
		props.setLoading(false);
	}, []);

	return (
		<>
			<Todo
				showComplete={false}
				setLoading={props.setLoading}
				flatDistributionIndicator={true}
			/>
			<Space h={'lg'} />
			<Activities setLoading={props.setLoading} limit={3} />
		</>
	);
};

export default Home;
