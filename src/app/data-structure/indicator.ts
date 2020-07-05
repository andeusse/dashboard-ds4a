export class Indicator {
	public id: number;
	public title: string;
	public value: number;
	public tendency: number;
	public icon: string;
	public unit: string;
	constructor(id: number, title: string, value: number, tendency: number, icon: string = "", unit: string = "") {
		this.id = id;
		this.title = title;
		this.value = value;
		this.tendency = tendency;
		this.icon = icon;
		this.unit = unit;
	}
}
