export interface Activity {
	id: string;
	created: Date;
	modified: Date;
	title: string;
	values: ActivityValue[];
	deleted: Date;
}

export interface ActivityValue {
	date: Date;
	value: number;
}
