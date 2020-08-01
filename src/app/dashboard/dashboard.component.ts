import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { States } from "../data-structure/states-cities"
import { StatesJsonService } from "../services/states-json.service";
import { Indicator } from '../data-structure/indicator';
import { CityTable } from '../data-structure/city-table';
import { MatSliderChange } from '@angular/material/slider';
import { News } from '../data-structure/news'

import { ApiBackendService } from "../services/api-backend.service";
import { CountryAPI, StateCityAPI, Dengue, SevereDengue, DeathsByDengue, CityTables, StateTables } from '../data-structure/api';
import {} from '@angular/google-maps'

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	news: Array<News> = [];
	todayDate;

	intervalID: NodeJS.Timeout;

	States: States = new States();

	isLoading: boolean = true;

	map: google.maps.Map;
	layerStates = new google.maps.Data({ map: this.map });
	layerCities = new google.maps.Data({ map: this.map });
	minLegendValue: number;
	maxLegendValue: number;

	scrollBarValue: number;
	minScrollBarYear: number = 2007;
	maxScrollBarYear: number = 2020;
	maxWeekData:Number = 16;

	displayedColumns: string[] = ['municipality', 'incidence', 'lethality'];

	statesDropDownList: Array<string>;
	statesSelected: Array<string> = [];
	idStateSelected: string = "";
	statesDropdownSettings: IDropdownSettings;
	statesDropDownListPlaceHolder = 'Select a state';

	citiesDropDownList: Array<string>;
	citiesSelected: Array<string> = [];
	idCitySelected: string = "";
	citiesDropdownSettings: IDropdownSettings;
	citiesDropDownListPlaceHolder = 'Select a city';

	_KPI: Array<Indicator> = [];
	MunicipalitiesTable: Array<CityTable> = [];
	dataSource = new MatTableDataSource<CityTable>([]);

	forecastingData = [];
	forecastingLabels = [];
	forecastingOptions = {};
	forecastingLegends = true;
	forecastingType = 'line';

	bortmanData = [];
	bortmanLabels = [];
	bortmanOptions = {};
	bortmanLegends = true;
	bortmanType = 'line';

	epidemiologicalBehaviorData = [];
	epidemiologicalBehaviorLabels = [];
	epidemiologicalBehaviorOptions = {};
	epidemiologicalBehaviorLegends = true;
	epidemiologicalBehaviorType = 'line';

	_MMWRData = [];
	_MMWRLabels = [];
	_MMWROptions = {};
	_MMWRLegends = true;
	_MMWRType = 'line';

	countryValues: CountryAPI;
	selectedStateCityValues: StateCityAPI;
	cityTableValues: CityTables;
	stateTableValues: StateTables;

	dataSet: CountryAPI | StateCityAPI;
	dataSetCurrentYearDengue: Dengue;
	dataSetCurrentYearSevereDengue: SevereDengue;
	dataSetCurrentYearDeathsDengue: DeathsByDengue;

	constructor(private StatesJsonService: StatesJsonService,
		private ApiBackendService: ApiBackendService) {
	}

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	@ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;

	ngOnInit(): void {
		this.initializeDashboard();
		this.queryCountryValues();
		this.queryTableCityValues();
		this.queryTableStateValues();
	}

	queryCountryValues() {
		this.isLoading = true;
		this.ApiBackendService.getCountryValues().then(value => {
			this.countryValues = value;
			this.refreshDashBoard();
		});
	}

	queryTableStateValues(){
		this.isLoading = true;
		this.ApiBackendService.getTableStateValues().then(value => {
			this.stateTableValues = value;
			this.initializeLayerStates();
		});
	}

	refreshStateMapValues(){
		let values = [];
		this.stateTableValues.table.forEach(year => {
			if (parseInt(year.year) == this.scrollBarValue) {
				year.states.forEach(state => {
					this.layerStates.getFeatureById(state.code).setProperty('Value', state.incidence);
					values.push(state.incidence);
				});
				this.minLegendValue = Math.min(...values);
				this.maxLegendValue = Math.max(...values);
				return;
			}
		});
	}

	queryTableCityValues(){
		this.isLoading = true;
		this.ApiBackendService.getTableCityValues().then(value => {
			this.cityTableValues = value;
			this.initializeLayerCities();
		});
	}

	refreshCityTableValues(){
		this.cityTableValues.table.forEach(year => {
			if (parseInt(year.year) == this.scrollBarValue) {
				this.MunicipalitiesTable = [];
				year.cities.forEach(city => {
					this.MunicipalitiesTable.push(new CityTable(city.state, city.city, parseFloat(city.incidence), parseFloat(city.lethality)));
				});
				this.sortByIncidence();
				return;
			}
		});
	}

	refreshCityMapValues(){
		let values = [];
		this.cityTableValues.table.forEach(year => {
			if (parseInt(year.year) == this.scrollBarValue) {
				year.cities.forEach(city => {
					let feature = this.layerCities.getFeatureById(city.code);
					if(feature){
						let code: string = city.code;
						let stateCode = code.substring(0, 2);
						if (this.idStateSelected == stateCode) {
							feature.setProperty('Value', city.incidence);
							values.push(city.incidence);
						}
					}
					this.minLegendValue = Math.min(...values);
					this.maxLegendValue = Math.max(...values);
				});
				this.sortByIncidence();
				return;
			}
		});
	}

	queryStateValues(){
		this.isLoading = true;
		this.ApiBackendService.getStateValues(this.idStateSelected).then(value => {
			this.selectedStateCityValues = value;
			this.refreshDashBoard();
		});
	}

	queryCityValues(){
		this.isLoading = true;
		this.ApiBackendService.getCityValues(this.idCitySelected).then(value => {
			this.selectedStateCityValues = value;
			this.refreshDashBoard();
		});
	}

	initializeDashboard(){
		this.scrollBarValue = 2020;
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;

		this.initializeKPI();
		this.initializeForecastingChart();
		this.initializeQuantileChart();
		this.initializeBortmanChart();
		this.initializeMMWRChart();
		this.initializeMap();
		this.initializeDropDownStates();
		this.initializeDropDownCities();

		this.news.push(new News("Alerta por 450 casos de dengue en Medellín en lo que va de 2020", "Semana", "https://www.semana.com/nacion/articulo/colombia-hoy-medellin-en-alerta-por-450-casos-de-dengue-en-lo-corrido-del-ano/682660"));
		this.news.push(new News("Noticia 2", "El Espectador", "https://www.google.com/"));
		this.news.push(new News("Noticia 3", "El Espectador", "https://www.google.com/"));
		this.news.push(new News("Noticia 4", "El Espectador", "https://www.google.com/"));
		this.news.push(new News("Noticia 5", "El Espectador", "https://www.google.com/"));

		let todayDate = new Date();
		this.todayDate = todayDate.getFullYear() + "/" + (todayDate.getMonth() + 1).toString() + "/" + todayDate.getDate();
	}

	refreshDashBoard() {
		this.dataSet = this.countryValues;
		if ((this.idStateSelected != "") || (this.idCitySelected != "")) {
			this.dataSet = this.selectedStateCityValues;
		}
		this.dataSet.dengue.forEach(year => {
			if (parseInt(year.year) == this.scrollBarValue) {
				this.dataSetCurrentYearDengue = year;
			}
		});
		this.dataSet.severe_dengue.forEach(year => {
			if (parseInt(year.year) == this.scrollBarValue) {
				this.dataSetCurrentYearSevereDengue = year;
			}
		});
		this.dataSet.deaths_by_dengue.forEach(year => {
			if (parseInt(year.year) == this.scrollBarValue) {
				this.dataSetCurrentYearDeathsDengue = year;
			}
		});
		this.refreshKPIValues();
		this.refreshForecastingChart();
		this.refreshQuantileChart();
		this.refreshBortmanChart();
		this.refreshMMWRChart();
		this.refreshCityTableValues();
		this.refreshDengometer()
		if(this.idStateSelected == "" && this.idCitySelected == ""){
			this.refreshStateMapValues();
		}
		else{
			this.refreshCityMapValues();
		}

		this.isLoading = false;
	}

	initializeKPI() {
		let temp = new Indicator(0, "Dengue", 0, 0, "[Cases]", "Incidence", 0, 0, "[Cases x 100000 people]", "exclamation-triangle");
		this._KPI.push(temp);
		temp = new Indicator(1, "Severe Dengue", 0, 0, "[Cases]", "Incidence", 0, 0, "[Cases x 100000 people]", "exclamation-triangle");
		this._KPI.push(temp);
		temp = new Indicator(2, "Deaths by Dengue", 0, 0, "[Deaths]", "Mortality rate", 0, 0, "[%]", "skull-crossbones");
		this._KPI.push(temp);
	}

	refreshKPIValues() {
		this._KPI[0].totalCases = parseInt(this.dataSetCurrentYearDengue.value);
		this._KPI[0].totalCasesTendency = parseFloat(this.dataSetCurrentYearDengue.pct_change);
		this._KPI[0].indicator = parseFloat(this.dataSetCurrentYearDengue.incidence);
		this._KPI[0].indicatorTendency = parseFloat(this.dataSetCurrentYearDengue.pct_change_incidence);

		this._KPI[1].totalCases = parseInt(this.dataSetCurrentYearSevereDengue.value);
		this._KPI[1].totalCasesTendency = parseFloat(this.dataSetCurrentYearSevereDengue.pct_change);
		this._KPI[1].indicator = parseFloat(this.dataSetCurrentYearSevereDengue.incidence);
		this._KPI[1].indicatorTendency = parseFloat(this.dataSetCurrentYearSevereDengue.pct_change_incidence);

		this._KPI[2].totalCases = parseInt(this.dataSetCurrentYearDeathsDengue.value);
		this._KPI[2].totalCasesTendency = parseFloat(this.dataSetCurrentYearDeathsDengue.pct_change);
		this._KPI[2].indicator = parseFloat(this.dataSetCurrentYearDeathsDengue.mortality_rate);
		this._KPI[2].indicatorTendency = parseFloat(this.dataSetCurrentYearDeathsDengue.pct_change_mortality_rate);
	}

	initializeForecastingChart() {
		this.forecastingOptions = {
			scaleShowVerticalLines: false,
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'top',
				labels: {
					fontColor: 'white'
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						tooltipFormat: 'DD/MM/YYYY',
						distribution: 'series'
					},
					ticks: {
						fontColor: 'white',
						maxRotation: 45,
						minRotation: 45,
						maxTicksLimit: 12
					}
				}],
				yAxes: [{
					id: 'default',
					display: true,
					ticks: {
						suggestedMin: 0,
						fontColor: 'white'
					},
				}]
			},
			tooltips: {
				mode: 'x'
			}
		};
		this.forecastingData = [];
		this.forecastingLabels = [];
		let data = [];
		
		let color = "white";
		this.forecastingData = [
			{ data: data, label: 'Dengue ' + this.scrollBarValue, fill: false, yAxisID: 'default',
			borderColor: color, backgroundColor: color,
			pointBackgroundColor: color, pointBorderColor: color }
		];
	}

	refreshForecastingChart(){
		this.forecastingData = [];
		let data = [];
		this.dataSetCurrentYearDengue.weekly.forEach(week =>{
			this.forecastingLabels.push(parseInt(week.week));
			if (!(parseInt(week.week) > this.maxWeekData && parseInt(this.dataSetCurrentYearDengue.year) == this.maxScrollBarYear)){
				data.push({x: week.timestamp, y: parseInt(week.value)});
			}
		});
		let color = "white";
		this.forecastingData = [
			{ data: data, label: 'Dengue ' + this.scrollBarValue, fill: false, yAxisID: 'default',
			borderColor: color, backgroundColor: color,
			pointBackgroundColor: color, pointBorderColor: color }
		];
	}

	initializeQuantileChart() {
		this.epidemiologicalBehaviorOptions = {
			scaleShowVerticalLines: false,
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'top',
				labels: {
					fontColor: 'white'
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						tooltipFormat: 'DD/MM/YYYY',
						distribution: 'series'
					},
					ticks: {
						fontColor: 'white',
						maxRotation: 45,
						minRotation: 45,
						maxTicksLimit: 12
					}
				}],
				yAxes: [{
					ticks: {
						fontColor: 'white'
					}
				}]
			},
			tooltips: {
				mode: 'x'
			}
		};

		this.epidemiologicalBehaviorData = [];
		this.epidemiologicalBehaviorLabels = [];
		let data = [];
		let datap25 = [];
		let datap50 = [];
		let datap75 = [];

		let dengueColor = 'white';
		let p25Color = 'green';
		let p50Color = 'yellow';
		let p75Color = 'red';

		this.epidemiologicalBehaviorData = [
			{
				data: data, label: this.scrollBarValue.toString(), fill: false, pointRadius: 3, pointHitRadius: 5, showLine: true,
				borderColor: dengueColor, backgroundColor: dengueColor,
				pointBackgroundColor: dengueColor, pointBorderColor: dengueColor
			},
			{
				data: datap25, label: 'P25', fill: false,
				borderColor: p25Color, backgroundColor: p25Color,
				pointBackgroundColor: p25Color, pointBorderColor: p25Color
			},
			{
				data: datap50, label: 'P50', fill: false,
				borderColor: p50Color, backgroundColor: p50Color,
				pointBackgroundColor: p50Color, pointBorderColor: p50Color
			},
			{
				data: datap75, label: 'P75', fill: false,
				borderColor: p75Color, backgroundColor: p75Color,
				pointBackgroundColor: p75Color, pointBorderColor: p75Color
			}
		];


	}

	refreshQuantileChart(){
		this.epidemiologicalBehaviorData = [];
		this.epidemiologicalBehaviorLabels = [];
		let data = [];
		let datap25 = [];
		let datap50 = [];
		let datap75 = [];

		this.dataSetCurrentYearDengue.weekly.forEach(week =>{
			this.forecastingLabels.push(parseInt(week.week));
			if (!(parseInt(week.week) > this.maxWeekData && parseInt(this.dataSetCurrentYearDengue.year) == this.maxScrollBarYear)){
				data.push({x: week.timestamp, y: parseInt(week.value)});
			}
			datap25.push({x: week.timestamp, y: parseInt(week.P25)});
			datap50.push({x: week.timestamp, y: parseInt(week.median)});
			datap75.push({x: week.timestamp, y: parseInt(week.P75)});
		});
		
		let dengueColor = 'white';
		let p25Color = 'green';
		let p50Color = 'yellow';
		let p75Color = 'red';
		this.epidemiologicalBehaviorData = [
			{
				data: data, label: this.scrollBarValue.toString(), fill: false, pointRadius: 3, pointHitRadius: 5, showLine: true,
				borderColor: dengueColor, backgroundColor: dengueColor,
				pointBackgroundColor: dengueColor, pointBorderColor: dengueColor
			},
			{
				data: datap25, label: 'P25', fill: false,
				borderColor: p25Color, backgroundColor: p25Color,
				pointBackgroundColor: p25Color, pointBorderColor: p25Color
			},
			{
				data: datap50, label: 'P50', fill: false,
				borderColor: p50Color, backgroundColor: p50Color,
				pointBackgroundColor: p50Color, pointBorderColor: p50Color
			},
			{
				data: datap75, label: 'P75', fill: false,
				borderColor: p75Color, backgroundColor: p75Color,
				pointBackgroundColor: p75Color, pointBorderColor: p75Color
			}
		];
	}

	initializeBortmanChart() {
		this.bortmanOptions = {
			scaleShowVerticalLines: false,
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'top',
				labels: {
					fontColor: 'white'
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						tooltipFormat: 'DD/MM/YYYY',
						distribution: 'series'
					},
					ticks: {
						fontColor: 'white',
						maxRotation: 45,
						minRotation: 45,
						maxTicksLimit: 12
					}
				}],
				yAxes: [{
					ticks: {
						fontColor: 'white'
					}
				}]
			},
			tooltips: {
				mode: 'x'
			}
		};

		this.bortmanData = [];
		this.bortmanLabels = [];
		let data = [];
		let dataLL = [];
		let datapTheshold = [];
		let datapUL = [];

		let yearColor = 'white';
		let p25Color = 'green';
		let p50Color = 'yellow';
		let p75Color = 'red';

		this.bortmanData = [
			{
				data: data, label: this.scrollBarValue.toString(), fill: false, pointRadius: 3, pointHitRadius: 5, showLine: true,
				borderColor: yearColor, backgroundColor: yearColor,
				pointBackgroundColor: yearColor, pointBorderColor: yearColor
			},
			{
				data: dataLL, label: 'Lower Limit IC95%', fill: false,
				borderColor: p25Color, backgroundColor: p25Color,
				pointBackgroundColor: p25Color, pointBorderColor: p25Color
			},
			{
				data: datapTheshold, label: 'Threshold', fill: false,
				borderColor: p50Color, backgroundColor: p50Color,
				pointBackgroundColor: p50Color, pointBorderColor: p50Color
			},
			{
				data: datapUL, label: 'Upper Limit IC95%', fill: false,
				borderColor: p75Color, backgroundColor: p75Color,
				pointBackgroundColor: p75Color, pointBorderColor: p75Color
			}
		];
	}

	refreshBortmanChart(){
		this.bortmanData = [];
		this.bortmanLabels = [];
		let data = [];
		let dataLL = [];
		let datapTheshold = [];
		let datapUL = [];
		
		this.dataSetCurrentYearDengue.weekly.forEach(week =>{
			if(parseInt(week.week) != 53){
				this.forecastingLabels.push(parseInt(week.week));
				if (!(parseInt(week.week) > this.maxWeekData && parseInt(this.dataSetCurrentYearDengue.year) == this.maxScrollBarYear)){
					data.push({x: week.timestamp, y: parseInt(week.value)});
				}
				dataLL.push({x: week.timestamp, y: parseInt(week.lower_limit_IC95)});
				datapTheshold.push({x: week.timestamp, y: parseInt(week.threshold_IC95)});
				datapUL.push({x: week.timestamp, y: parseInt(week.upper_limit_IC95)});
			}
		});
		
		let yearColor = 'white';
		let p25Color = 'green';
		let p50Color = 'yellow';
		let p75Color = 'red';

		this.bortmanData = [
			{
				data: data, label: this.scrollBarValue.toString(), fill: false, pointRadius: 3, pointHitRadius: 5, showLine: true,
				borderColor: yearColor, backgroundColor: yearColor,
				pointBackgroundColor: yearColor, pointBorderColor: yearColor
			},
			{
				data: dataLL, label: 'Lower Limit IC95%', fill: false,
				borderColor: p25Color, backgroundColor: p25Color,
				pointBackgroundColor: p25Color, pointBorderColor: p25Color
			},
			{
				data: datapTheshold, label: 'Threshold', fill: false,
				borderColor: p50Color, backgroundColor: p50Color,
				pointBackgroundColor: p50Color, pointBorderColor: p50Color
			},
			{
				data: datapUL, label: 'Upper Limit IC95%', fill: false,
				borderColor: p75Color, backgroundColor: p75Color,
				pointBackgroundColor: p75Color, pointBorderColor: p75Color
			}
		];
	}

	initializeMMWRChart() {
		this._MMWROptions = {
			scaleShowVerticalLines: false,
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'top',
				labels: {
					fontColor: 'white'
				}
			},
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						tooltipFormat: 'DD/MM/YYYY',
						distribution: 'series'
					},
					ticks: {
						fontColor: 'white',
						maxRotation: 45,
						minRotation: 45,
						maxTicksLimit: 12
					}
				}],
				yAxes: [{
					ticks: {
						fontColor: 'white'
					}
				}]
			},
			tooltips: {
				mode: 'x'
			}
		};

		this._MMWRData = [];
		this._MMWRLabels = [];
		let data = [];
		let upperLimit = [];
		let lowerLimit = [];
		let expectedReason = [];

		let yearColor = 'white';
		let upperLimitColor = 'red';
		let lowerLimitColor = 'green';
		let expectedReasonColor = 'black';

		this._MMWRData = [
			{
				data: data, label: 'Observed Reason ' + this.scrollBarValue, fill: false, pointRadius: 7, showLine: false,
				borderColor: yearColor, backgroundColor: yearColor,
				pointBackgroundColor: yearColor, pointBorderColor: yearColor
			},
			{
				data: upperLimit, label: 'Upper Limit', fill: false,
				borderColor: upperLimitColor, backgroundColor: upperLimitColor,
				pointBackgroundColor: upperLimitColor, pointBorderColor: upperLimitColor
			},
			{
				data: lowerLimit, label: 'Lower Limit', fill: false,
				borderColor: lowerLimitColor, backgroundColor: lowerLimitColor,
				pointBackgroundColor: lowerLimitColor, pointBorderColor: lowerLimitColor
			},
			{
				data: expectedReason, label: 'Expected Reason', fill: false, pointRadius: 3, showLine: false,
				borderColor: expectedReasonColor, backgroundColor: expectedReasonColor,
				pointBackgroundColor: expectedReasonColor, pointBorderColor: expectedReasonColor
			}
		];
	}

	refreshMMWRChart(){
		this._MMWRData = [];
		this._MMWRLabels = [];
		let data = [];
		let upperLimit = [];
		let lowerLimit = [];
		let expectedReason = [];
		
		this.dataSetCurrentYearDengue.weekly.forEach(week =>{
			this.forecastingLabels.push(parseInt(week.week));
			if (!(parseInt(week.week) > this.maxWeekData && parseInt(this.dataSetCurrentYearDengue.year) == this.maxScrollBarYear)){
				data.push({x: week.timestamp, y: week.observed_reason});
			}
			upperLimit.push({x: week.timestamp, y: week.upper_limit});
			lowerLimit.push({x: week.timestamp, y: week.lower_limit});
			expectedReason.push({x: week.timestamp, y: week.expected_reason});
		});
		
		let yearColor = 'white';
		let upperLimitColor = '#FF8000';
		let lowerLimitColor = '#2848DF';
		let expectedReasonColor = 'black';

		this._MMWRData = [
			{
				data: data, label: 'Observed Reason ' + this.scrollBarValue, fill: false, pointRadius: 5, showLine: false,
				borderColor: yearColor, backgroundColor: yearColor,
				pointBackgroundColor: yearColor, pointBorderColor: yearColor
			},
			{
				data: upperLimit, label: 'Upper Limit', fill: false,
				borderColor: upperLimitColor, backgroundColor: upperLimitColor,
				pointBackgroundColor: upperLimitColor, pointBorderColor: upperLimitColor
			},
			{
				data: lowerLimit, label: 'Lower Limit', fill: false,
				borderColor: lowerLimitColor, backgroundColor: lowerLimitColor,
				pointBackgroundColor: lowerLimitColor, pointBorderColor: lowerLimitColor
			},
			{
				data: expectedReason, label: 'Expected Reason', fill: false, pointRadius: 3, showLine: false,
				borderColor: expectedReasonColor, backgroundColor: expectedReasonColor,
				pointBackgroundColor: expectedReasonColor, pointBorderColor: expectedReasonColor
			}
		];
	}

	refreshDengometer(){
		let value;
		let expectedReason;
		let upperlimit;

		let tempData;

		if(this.idStateSelected == "" && this.idCitySelected == ""){
			tempData = this.countryValues;
		}
		else{
			tempData = this.selectedStateCityValues;
		}
		tempData.dengue.forEach(year => {
			if(parseInt(year.year) == this.maxScrollBarYear){
				year.weekly.forEach(week => {
					if(parseInt(week.week) == this.maxWeekData){
						value = parseFloat(week.observed_reason);
						expectedReason = parseFloat(week.expected_reason);
						upperlimit = parseFloat(week.upper_limit);
						let color = 'green';
						if (value > upperlimit) {
							color = 'red';
						} else if (value > expectedReason) {
							color = 'orange';
						}
						document.getElementById('dengometer-icon').style.color = color;
						return;
					}
				});
			}
		});
	}

	initializeMap() {
		let self = this;
		let mapOptions: google.maps.MapOptions = {
			zoomControl: false,
			scrollwheel: true,
			disableDoubleClickZoom: true,
			streetViewControl: false,
			fullscreenControl: false,
			zoom: 5,
			maxZoom: 9,
			minZoom: 5,
			mapTypeControl: false,
			center: {
				lat: 4.5709,
				lng: -74.2973
			},
			// draggable: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: [
				{ elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
				{ elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
				{ elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
				{
					featureType: 'administrative.locality',
					elementType: 'labels.text.fill',
					stylers: [{ color: '#d59563' }]
				},
				{
					featureType: 'poi',
					elementType: 'labels.text.fill',
					stylers: [{ color: '#d59563' }]
				},
				{
					featureType: 'poi.park',
					elementType: 'geometry',
					stylers: [{ color: '#263c3f' }]
				},
				{
					featureType: 'poi.park',
					elementType: 'labels.text.fill',
					stylers: [{ color: '#6b9a76' }]
				},
				{
					featureType: 'road',
					elementType: 'geometry',
					stylers: [{ color: '#38414e' }]
				},
				{
					featureType: 'road',
					elementType: 'geometry.stroke',
					stylers: [{ color: '#212a37' }]
				},
				{
					featureType: 'road',
					elementType: 'labels.text.fill',
					stylers: [{ color: '#9ca5b3' }]
				},
				{
					featureType: 'road.highway',
					elementType: 'geometry',
					stylers: [{ color: '#746855' }]
				},
				{
					featureType: 'road.highway',
					elementType: 'geometry.stroke',
					stylers: [{ color: '#1f2835' }]
				},
				{
					featureType: 'road.highway',
					elementType: 'labels.text.fill',
					stylers: [{ color: '#f3d19c' }]
				},
				{
					featureType: 'transit',
					elementType: 'geometry',
					stylers: [{ color: '#2f3948' }]
				},
				{
					featureType: 'transit.station',
					elementType: 'labels.text.fill',
					stylers: [{ color: '#d59563' }]
				},
				{
					featureType: 'water',
					elementType: 'geometry',
					stylers: [{ color: '#000000' }]
				},
				{
					featureType: 'water',
					elementType: 'labels.text.fill',
					stylers: [{ color: '#515c6d' }]
				},
				{
					featureType: 'water',
					elementType: 'labels.text.stroke',
					stylers: [{ color: '#17263c' }]
				}
			]
		}
		this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	}

	initializeLayerStates() {
		let self = this;
		this.layerStates = new google.maps.Data({ map: this.map });
		this.layerStates.loadGeoJson('assets/Colombia.geo.json', { idPropertyName: 'Code' }, function (features) {

		});

		this.layerStates.setStyle(function (feature) {
			let value = feature.getProperty('Value');
			let color = self.setFeatureColor(value);
			return ({
				fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
				strokeColor: 'white',
				fillOpacity: 0.5,
				strokeWeight: 0.5,
				strokeOpacity: 1,
				visible: true
			});
		});

		this.layerStates.addListener('click', function (event) {
			self.statesSelected = [];
			self.statesSelected[0] = event.feature.getProperty('Name');
			self.idStateSelected = event.feature.getProperty('Code');
			self.onStateSelect();
		});

		this.layerStates.addListener('mouseover', function (event) {
			if (self.idStateSelected == "") {
				self.layerStates.overrideStyle(event.feature, { strokeWeight: 5, fillOpacity: 1 });
			}
			self.setLegendValue(true, event.feature);
		});

		this.layerStates.addListener('mouseout', function (event) {
			if (self.idStateSelected == "") {
				self.layerStates.revertStyle(event.feature);
			}
			self.setLegendValue(false);
		});
	}

	initializeLayerCities() {
		let self = this;
		this.layerCities = new google.maps.Data({ map: this.map });
		this.layerCities.loadGeoJson('/assets/ColombiaMunSimp.json', { idPropertyName: 'Code' }, function (features) {
			features.forEach(feature => {
				feature.setProperty('Value', 0);
			});
		});

		this.layerCities.setStyle(function (feature) {
			let value = feature.getProperty('Value');
			let color = self.setFeatureColor(value);
			return ({
				fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
				strokeColor: 'white',
				fillOpacity: 0.5,
				strokeWeight: 0.5,
				strokeOpacity: 1,
				visible: false
			});
		});

		this.layerCities.addListener('click', function (event) {
			self.idCitySelected = event.feature.getProperty('Code');
			self.States.states.forEach(state => {
				if (state.code == self.idStateSelected) {
					state.municipalities.forEach(municipality => {
						if (municipality.code == self.idCitySelected) {
							self.citiesSelected = [];
							self.citiesSelected[0] = municipality.name;
							return;
						}
					});
				}
			});
		});

		this.layerCities.addListener('mouseover', function (event) {
			self.layerCities.overrideStyle(event.feature, { strokeWeight: 5, fillOpacity: 1 });
			self.setLegendValue(true, event.feature);
		});

		this.layerCities.addListener('mouseout', function (event) {
			self.layerCities.overrideStyle(event.feature, { strokeWeight: 0.5, fillOpacity: 0.5 });
			self.setLegendValue(false);
		});
	}

	setLegendValue(showValue: boolean, feature: google.maps.Data.Feature = null) {
		if (showValue) {
			var percent = (feature.getProperty('Value') - this.minLegendValue) / (this.maxLegendValue - this.minLegendValue) * 100;
			document.getElementById('data-label').textContent = feature.getProperty('Name');
			document.getElementById('data-value').textContent = feature.getProperty('Value').toLocaleString() + ' [Cases x 100000 people]';
			document.getElementById('data-box').style.display = 'block';
			document.getElementById('data-caret').style.display = 'block';
			document.getElementById('data-caret').style.paddingLeft = percent + '%';
		}
		else {
			document.getElementById('data-box').style.display = 'none';
			document.getElementById('data-caret').style.display = 'none';
		}
	}

	setFeatureColor(value: number) {
		let color = [];
		if (!isNaN(value)) {
			let low = [151, 83, 34];
			let high = [5, 69, 54];
			let delta = (value - this.minLegendValue) / (this.maxLegendValue - this.minLegendValue);
			for (var i = 0; i < 3; i++) {
				color[i] = (high[i] - low[i]) * delta + low[i];
			}
		}
		else {
			color = [255, 255, 255];
		}
		return color;
	}

	initializeDropDownStates() {
		this.statesDropdownSettings = {
			singleSelection: true,
			textField: 'item_text',
			allowSearchFilter: true,
			maxHeight: 300
		};
		this.StatesJsonService.getStates().then(value => {
			this.States = value;
			this.statesDropDownList = [];
			this.States.states.forEach(state => {
				this.statesDropDownList.push(state.name);
			});
		});
	}

	initializeDropDownCities() {
		this.citiesDropdownSettings = {
			singleSelection: true,
			textField: 'item_text',
			allowSearchFilter: true,
			maxHeight: 300
		};
	}

	onStateSelect() {
		this.citiesDropDownList = [];
		this.citiesSelected = [];
		this.States.states.forEach(state => {
			if (this.statesSelected[0] == state.name) {
				let center = this.layerStates.getFeatureById(state.code).getProperty('Center');
				this.map.setCenter(center);
				state.municipalities.forEach(municipality => {
					this.citiesDropDownList.push(municipality.name);
				});
				this.idStateSelected = state.code;
				this.queryStateValues();
				this.layerStates.forEach(feature => {
					this.layerStates.overrideStyle(feature, { visible: false });
				});
				this.layerCities.forEach(feature => {
					let code: string = feature.getProperty('Code');
					let stateCode = code.substring(0, 2);
					if (this.idStateSelected == stateCode) {
						this.layerCities.overrideStyle(feature, { visible: true });
					} 
					else {
						this.layerCities.overrideStyle(feature, { visible: false });
					}
				});

				this.map.setZoom(7);
			}
		});
	}

	onStateDeselect() {
		this.idStateSelected = "";
		this.idCitySelected = "";
		this.citiesDropDownList = [];
		this.citiesSelected = [];
		this.centerMap();
		this.layerStates.forEach(feature => {
			this.layerStates.revertStyle(feature);
		});
		this.layerCities.forEach(feature => {
			this.layerCities.revertStyle(feature);
		});
		this.refreshDashBoard();
	}

	onCitySelect() {
		this.States.states.forEach(state => {
			if (this.statesSelected[0] == state.name) {
				state.municipalities.forEach(municipality => {
					if (this.citiesSelected[0] == municipality.name) {
						this.idCitySelected = municipality.code;
						this.queryCityValues();
						return;
					}
				});
			}
		});
	}

	onCityDeselect() {
		this.idCitySelected = "";
		this.queryStateValues();
	}

	centerMap() {
		this.map.setCenter({ lat: 4.5709, lng: -74.2973 });
		this.map.setZoom(5);
	}

	playTimer() {
		if (this.intervalID) {
			clearInterval(this.intervalID);
		}
		let self = this;
		let startYear = this.minScrollBarYear;
		this.intervalID = setInterval(function () {
			self.scrollBarValue = startYear;
			startYear = startYear + 1;
			self.refreshDashBoard();
			if (startYear > self.maxScrollBarYear) {
				clearInterval(self.intervalID);
			}
		}, 2000);
	}

	pauseTimer() {
		clearInterval(this.intervalID);
	}

	scrollBarChange(event: MatSliderChange) {
		this.scrollBarValue = event.value;
		this.refreshDashBoard();
	}

	updateCharts() {
		this.charts.forEach((chart) => {
			chart.update();
		});
	}

	randomCharts() {
		let data = [];
		let startDate = getFirstSunday(this.scrollBarValue);
		let nowDate = new Date();

		if (this.scrollBarValue == this.maxScrollBarYear) {
			this.forecastingData = [];
			this.forecastingLabels = [];
			let valueDate: Date;
			data = [];
			let dataForecast = [];
			startDate = getFirstSunday(this.scrollBarValue);
			nowDate = new Date();
			for (let i = 0; i <= 53; i++) {
				valueDate = addDays(startDate, i * 7);
				if (valueDate.getFullYear() <= this.scrollBarValue && valueDate <= nowDate) {
					this.forecastingLabels.push(valueDate);
					let randomValue = Math.floor(20 * Math.random() + 1);
					data.push({ x: valueDate, y: randomValue });
				}
				else {
					dataForecast.push(data[data.length - 1]);
					break;
				}
			}

			startDate = valueDate;
			for (let i = 0; i < 8; i++) {
				valueDate = addDays(startDate, i * 7);
				this.forecastingLabels.push(valueDate);
				dataForecast.push({ x: valueDate, y: Math.floor(20 * Math.random() + 1) });
			}

			let dataForecast1 = [];
			let dataForecast2 = [];

			for (let i = 0; i < dataForecast.length; i++) {
				dataForecast1.push({ x: dataForecast[i].x, y: dataForecast[i].y + 5 });
				dataForecast2.push({ x: dataForecast[i].x, y: dataForecast[i].y - 2 });
			}

			let confidenceIntervalColor = '#ccc';

			this.forecastingData = [
				{ data: data, label: 'Dengue', fill: false, yAxisID: 'default' },
				{ data: dataForecast, label: 'Forecast', fill: false, yAxisID: 'default' },
				{
					data: dataForecast1, label: '+ Confidence Interval', fill: false, yAxisID: 'default',
					borderColor: confidenceIntervalColor, backgroundColor: confidenceIntervalColor, pointBackgroundColor: confidenceIntervalColor, pointBorderColor: confidenceIntervalColor
				},
				{
					data: dataForecast2, label: '- Confidence Interval', fill: '-1', yAxisID: 'default',
					borderColor: confidenceIntervalColor, backgroundColor: confidenceIntervalColor, pointBorderColor: confidenceIntervalColor
				}
			];
		}



		this.epidemiologicalBehaviorData = [];
		this.epidemiologicalBehaviorLabels = [];
		data = [];
		let datap25 = [];
		let datap50 = [];
		let datap75 = [];
		startDate = getFirstSunday(this.scrollBarValue);
		nowDate = new Date();

		for (let i = 0; i < 53; i++) {
			let valueDate = addDays(startDate, i * 7);
			if (valueDate.getFullYear() <= this.scrollBarValue && valueDate <= nowDate) {
				data.push(Math.floor(100 * Math.random()));
			}
			this.epidemiologicalBehaviorLabels.push(valueDate);
			datap25.push(Math.floor(20 * Math.random()));
			datap50.push(Math.floor(30 * Math.random() + 20));
			datap75.push(Math.floor(70 * Math.random() + 50));
		}

		let yearColor = 'white';
		let p25Color = 'green';
		let p50Color = 'yellow';
		let p75Color = 'red';

		this.epidemiologicalBehaviorData = [
			{
				data: data, label: this.scrollBarValue.toString(), fill: false, pointRadius: 3, pointHitRadius: 5, showLine: true,
				borderColor: yearColor, backgroundColor: yearColor,
				pointBackgroundColor: yearColor, pointBorderColor: yearColor
			},
			{
				data: datap25, label: 'P25', fill: false,
				borderColor: p25Color, backgroundColor: p25Color,
				pointBackgroundColor: p25Color, pointBorderColor: p25Color
			},
			{
				data: datap50, label: 'P50', fill: false,
				borderColor: p50Color, backgroundColor: p50Color,
				pointBackgroundColor: p50Color, pointBorderColor: p50Color
			},
			{
				data: datap75, label: 'P75', fill: false,
				borderColor: p75Color, backgroundColor: p75Color,
				pointBackgroundColor: p75Color, pointBorderColor: p75Color
			}
		];



		this._MMWRData = [];
		this._MMWRLabels = [];
		data = [];
		let upperLimit = [];
		let lowerLimit = [];
		let expectedReason = [];
		startDate = getFirstSunday(this.scrollBarValue);
		nowDate = new Date();
		for (let i = 0; i < 53; i++) {
			let valueDate = addDays(startDate, i * 7);
			if (valueDate.getFullYear() <= this.scrollBarValue && valueDate <= nowDate) {
				data.push((3 * Math.random()));
			}
			this._MMWRLabels.push(valueDate);
			upperLimit.push((2 * Math.random() + 3));
			lowerLimit.push((-2 * Math.random() - 1));
			expectedReason.push(1);
		}

		yearColor = 'white';
		let upperLimitColor = 'red';
		let lowerLimitColor = 'red';
		let expectedReasonColor = 'black';

		this._MMWRData = [
			{
				data: data, label: 'Observed Reason', fill: false, pointRadius: 10, showLine: false,
				borderColor: yearColor, backgroundColor: yearColor,
				pointBackgroundColor: yearColor, pointBorderColor: yearColor
			},
			{
				data: upperLimit, label: 'Upper Limit', fill: false,
				borderColor: upperLimitColor, backgroundColor: upperLimitColor,
				pointBackgroundColor: upperLimitColor, pointBorderColor: upperLimitColor
			},
			{
				data: lowerLimit, label: 'Lower Limit', fill: false,
				borderColor: lowerLimitColor, backgroundColor: lowerLimitColor,
				pointBackgroundColor: lowerLimitColor, pointBorderColor: lowerLimitColor
			},
			{
				data: expectedReason, label: 'Expected Reason', fill: false, pointRadius: 3, showLine: false,
				borderColor: expectedReasonColor, backgroundColor: expectedReasonColor,
				pointBackgroundColor: expectedReasonColor, pointBorderColor: expectedReasonColor
			}
		];


		this.updateCharts();
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	sortByIncidence() {
		this.MunicipalitiesTable.sort(compareValues('incidence', 'desc'));
		this.dataSource.data = this.MunicipalitiesTable;
	}

	sortByLethality() {
		this.MunicipalitiesTable.sort(compareValues('lethality', 'desc'));
		this.dataSource.data = this.MunicipalitiesTable;
	}

	buildInfoWindowsHTML(feature: { getProperty: (arg0: string) => string | number; }) {
		let content = '';
		content = `<div class="text-center">
			<div class="bg-dark text-light card">  
			<div class="card-header text-center">
				<h4 class="my-0 font-weight-normal">`+ feature.getProperty('Name') + `</h4>
			</div>
			<div class="card-body text-center">
				<p class="card-title pricing-card-title">Area: ` + formatNumber((Number(feature.getProperty('Area')) / 1E6).toFixed(0)) + ` km<sup>2</sup></p>
				<p class="card-title pricing-card-title">Value: ` + Number(feature.getProperty('Value')) + ` Cases</p>
			</div>
			</div>
			</div>`
		return content;
		function formatNumber(num: string) {
			return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
		}
	}

}

function addDays(date: Date, days: number) {
	let result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function getFirstSunday(year: number) {
	let date = new Date(year, 0, 1, 0, 0, 0, 0);
	for (let i = 0; i < 6; i++) {
		if (date.getDay() == 0) {
			break;
		} else {
			date = addDays(date, -1);
		}
	}
	return date;
}

function compareValues(key: string, order = 'asc') {
	return function innerSort(a, b) {
		if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
			return 0;
		}

		const varA = (typeof a[key] === 'string')
			? a[key].toUpperCase() : a[key];
		const varB = (typeof b[key] === 'string')
			? b[key].toUpperCase() : b[key];

		let comparison = 0;
		if (varA > varB) {
			comparison = 1;
		} else if (varA < varB) {
			comparison = -1;
		}
		return (
			(order === 'desc') ? (comparison * -1) : comparison
		);
	};
}