import { FunctionComponent } from 'react';
import React from 'react';
import SortingIndicator from './SortingIndicator';

interface Props {
	title: string;
	sortParam: string;
	sortItems: () => void;
	currentSorting: {
		ascending: boolean;
		sortBy: string;
	};
}

const SortableHeader: FunctionComponent<Props> = (props) => {
	return (
		<th onClick={() => props.sortItems()}>
			{props.title}{' '}
			<SortingIndicator
				sorting={props.currentSorting}
				sortParam={props.sortParam}
			/>
		</th>
	);
};

export default SortableHeader;
