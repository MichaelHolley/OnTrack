export interface EntityBase {
	created: Date;
	modified?: Date;
}

export interface Activity extends EntityBase {
	id: string;
	title: string;
	values: ActivityValue[];
	deleted?: Date;
}

export interface ActivityValue {
	date: Date;
	value: number;
}

export enum TodoState {
	Open = 0,
	InProgress = 1,
	Complete = 2,
}

export interface TodoItem extends EntityBase {
	id: string;
	title: string;
	state: TodoState;
	deleted?: Date;
}

export enum Rythm {
	Daily = 1,
	Weekly = 2,
	Monthly = 3,
	Quarterly = 4,
	HalfYearly = 5,
	Year = 6,
}

export interface Expense extends EntityBase {
	id: string;
	title: string;
	rythm: Rythm;
	amount: number;
	color: string;
	deleted?: Date;
}
