export interface Activity {
	id: string;
	title: string;
	values: ActivityValue[];
	created: Date;
	modified: Date | undefined;
	deleted: Date | undefined;
}

export interface ActivityValue {
	date: Date;
	value: number;
}

export interface TodoItem {
	id: string;
	title: string;
	state: TodoState;
	created: Date;
	modified: Date | undefined;
	deleted: Date | undefined;
}

export enum TodoState {
	Open = 0,
	InProgress = 1,
	Complete = 2,
}
