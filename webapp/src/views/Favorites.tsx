import { Title } from '@mantine/core';
import React from 'react';

interface Props {
	setLoading: (val: boolean) => void;
}

const Favorites = (props: Props) => {
	return <Title>{'Favorites'}</Title>;
};

export default Favorites;
