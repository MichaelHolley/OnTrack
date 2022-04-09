import React from 'react';
import { Title } from '@mantine/core';

interface Props {
	setLoading: (val: boolean) => void;
}

const Home = (props: Props) => {
	return <Title>Home</Title>;
};

export default Home;
