import React, { useEffect } from 'react';
import { Title } from '@mantine/core';

interface Props {
	setLoading: (val: boolean) => void;
}

const Home = (props: Props) => {
	useEffect(() => {
		props.setLoading(false);
	}, []);

	return <Title>Home</Title>;
};

export default Home;
