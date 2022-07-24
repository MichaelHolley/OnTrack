import { FunctionComponent } from 'react';
import { ArrowNarrowDown, ArrowNarrowUp } from 'tabler-icons-react';
import React from 'react';

interface Props {
	sorting: {
		ascending: boolean;
		sortBy: string;
	};
	sortParam: string;
}

const SortingIndicator: FunctionComponent<Props> = (props) => {
	if (props.sortParam === props.sorting.sortBy) {
		if (props.sorting.ascending) {
			return <ArrowNarrowUp size={12} />;
		} else {
			return <ArrowNarrowDown size={12} />;
		}
	} else {
		return <></>;
	}
};

export default SortingIndicator;
