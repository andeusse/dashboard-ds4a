export class Indicator {
	public id: number;
	public title: string;
	public totalCases: number;
	public totalCasesTendency: number;
	public totalCasesUnit: string;
	public indicatorName: string;
	public indicator: number;
	public indicatorTendency: number;
	public indicatorUnit: string;
	public icon: string;
	constructor(id: number, title: string, totalCases: number, totalCasesTendency: number, totalCasesUnit: string,
		indicatorName: string, indicator: number, indicatorTendency: number, indicatorUnit: string, icon: string = "") {
		this.id = id;
		this.title = title;
		this.totalCases = totalCases;
		this.totalCasesTendency = totalCasesTendency;
		this.totalCasesUnit = totalCasesUnit;
		this.indicatorName = indicatorName;
		this.indicator = indicator;
		this.indicatorTendency = indicatorTendency;
		this.indicatorUnit = indicatorUnit;
		this.icon = icon;
	}
}
