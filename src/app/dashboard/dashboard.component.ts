import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { States } from "../data-structure/departmens-municipalities"
import { StatesJsonService } from "../services/states-json.service";
import { Indicator } from '../data-structure/indicator';
import { MunicipalityTable } from '../data-structure/municipality-table';
import { MatSliderChange } from '@angular/material/slider';
import { stat } from 'fs';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	intervalID: NodeJS.Timeout;

	States: States = new States();

	isLoading: boolean = true;

	map: google.maps.Map;
	layerStates = new google.maps.Data({ map: this.map });
	layerMunicipalities = new google.maps.Data({ map: this.map });
	minLegendValue: number;
	maxLegendValue: number;
	selectedFeature: google.maps.Data.Feature;

	scrollBarValue: number;
	minScrollBarYear: number = 2010;
	maxScrollBarYear: number = 2020;

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
	MunicipalitiesTable: Array<MunicipalityTable> = [];
	dataSource = new MatTableDataSource<MunicipalityTable>([]);

	forecastingData = [];
	forecastingLabels = [];
	forecastingOptions = {};
	forecastingLegends = true;
	forecastingType = 'line';

	weeklyData = [];
	weeklyLabels = [];
	weeklyOptions = {};
	weeklyLegends = true;
	weeklyType = 'line';

	monthlyData = [];
	monthlyLabels = [];
	monthlyOptions = {};
	monthlyLegends = true;
	monthlyType = 'bar';

	constructor(private StatesJsonService: StatesJsonService,) {
	}

	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild(MatSort, {static: true}) sort: MatSort;

	@ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;

	ngOnInit(): void {
		this.scrollBarValue = 2020;
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;

		this.initializeKPI();
		this.initializeMonthlyChart();
		this.initializeWeeklyChart();
		this.initializeForecastingChart();
		this.initializeMap();
		this.initializeLayerMunicipalities();
		this.initializeLayerStates();
		this.initializeDropDownStates();
		this.initializeDropDownCities();
	}

	initializeKPI() {
		let temp = new Indicator(0, "Dengue", 100, 2.1, "[Cases]", "Incidence", 10, -3.1, "[Cases x 100000 people]", "exclamation-triangle");
		this._KPI.push(temp);
		temp = new Indicator(1, "Severe Dengue", 100, -5, "[Cases]", "Incidence", 10, -3.1, "[Cases x 100000 people]", "exclamation-triangle");
		this._KPI.push(temp);
		temp = new Indicator(2, "Deaths by Dengue", 100, 8, "[Deaths]", "Mortality rate", 10, -3.1, "[%]", "skull-crossbones");
		this._KPI.push(temp);
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
						minRotation: 45
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
		let valueDate: Date;
		let data = [];
		let dataForecast = [];
		let startDate = getFirstSunday(this.scrollBarValue);
		let nowDate = new Date();
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
				data: dataForecast2, label: '- Confidence Interval', fill: '-1', yAxisID: 'default', fillOpacity: .3,
				borderColor: confidenceIntervalColor, backgroundColor: confidenceIntervalColor, pointBorderColor: confidenceIntervalColor
			}
		];
	}

	initializeWeeklyChart() {
		this.weeklyOptions = {
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
					},
					stacked: true
				}],
				yAxes: [{
					ticks: {
						fontColor: 'white'
					},
					stacked: true
				}]
			},
			tooltips: {
				mode: 'x'
			}
		};
		this.weeklyData = [];
		this.weeklyLabels = [];
		let data = [];
		let startDate = getFirstSunday(this.scrollBarValue);
		let nowDate = new Date();
		for (let i = 0; i < 53; i++) {
			let valueDate = addDays(startDate, i * 7);
			if (valueDate.getFullYear() <= this.scrollBarValue && valueDate <= nowDate) {
				this.weeklyLabels.push(valueDate);
				data.push(Math.floor(20 * Math.random() + 1));
			}
			else {
				break;
			}
		}
		this.weeklyData = [
			{ data: data, label: 'Dengue' },
			{ data: data, label: 'Severe Dengue' },
			{ data: data, label: 'Deaths by Dengue' }
		];
	}

	initializeMonthlyChart() {
		this.monthlyOptions = {
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
					ticks: {
						fontColor: 'white'
					}
				}],
				yAxes: [{
					ticks: {
						fontColor: 'white'
					}
				}]
			},
			tooltips: {
				mode: 'index'
			}
		};
		this.monthlyLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
		this.monthlyData = [
			{ data: [65, 59, 80, 81, 56, 55, 40, 65, 53, 3, 43, 34], label: 'Dengue' },
			{ data: [28, 48, 40, 19, 86, 27, 90, 12, 12, 54, 56, 34], label: 'Severe Dengue' },
			{ data: [28, 48, 40, 19, 86, 27, 90, 12, 12, 54, 56, 34], label: 'Deaths by Dengue' }
		];
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
			self.randomMapValues();
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

	initializeLayerMunicipalities() {
		let self = this;
		this.layerMunicipalities = new google.maps.Data({ map: this.map });
		this.layerMunicipalities.loadGeoJson('/assets/ColombiaMunSimp.json', { idPropertyName: 'Code' }, function (features) {
			self.randomMapValues();
			self.minLegendValue = 0;
			self.maxLegendValue = 200;
			self.isLoading = false;
		});

		this.layerMunicipalities.setStyle(function (feature) {
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

		this.layerMunicipalities.addListener('click', function (event) {
			self.idCitySelected = event.feature.getProperty('Code');
			self.States.states.forEach(state => {
				if (state.code == self.idStateSelected) {
					state.municipalities.forEach(municipality => {
						if (municipality.code == self.idCitySelected) {
							self.citiesSelected = [];
							self.citiesSelected[0] = municipality.name;
							self.map.setCenter({ lat: municipality.lat, lng: municipality.lng });
							self.map.setZoom(8);
							self.randomDashboard();
							return;
						}
					});
				}
			});
		});

		this.layerMunicipalities.addListener('mouseover', function (event) {
			self.layerMunicipalities.overrideStyle(event.feature, { strokeWeight: 5, fillOpacity: 1 });
			self.setLegendValue(true, event.feature);
		});

		this.layerMunicipalities.addListener('mouseout', function (event) {
			self.layerMunicipalities.overrideStyle(event.feature, { strokeWeight: 0.5, fillOpacity: 0.5 });
			self.setLegendValue(false);
		});
	}

	setLegendValue(showValue: boolean, feature: google.maps.Data.Feature = null) {
		if (showValue) {
			var percent = (feature.getProperty('Value') - this.minLegendValue) / (this.maxLegendValue - this.minLegendValue) * 100;
			document.getElementById('data-label').textContent = feature.getProperty('Name');
			document.getElementById('data-value').textContent = feature.getProperty('Value').toLocaleString() + ' cases';
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
			this.randomTable();
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
		if (this.selectedFeature) {
			this.layerStates.revertStyle(this.selectedFeature);
		}
		this.citiesDropDownList = [];
		this.citiesSelected = [];
		this.States.states.forEach(state => {
			if (this.statesSelected[0] == state.name) {
				this.selectedFeature = this.layerStates.getFeatureById(state.code);
				let center = this.selectedFeature.getProperty('Center');
				this.map.setCenter(center);
				state.municipalities.forEach(municipality => {
					this.citiesDropDownList.push(municipality.name);
				});
				this.idStateSelected = state.code;

				this.layerStates.forEach(feature => {
					this.layerStates.overrideStyle(feature, { visible: false });
				});
				this.layerMunicipalities.forEach(feature => {
					let code: string = feature.getProperty('Code');
					let stateCode = code.substring(0, 2);
					if (this.idStateSelected == stateCode) {
						this.layerMunicipalities.overrideStyle(feature, { visible: true });
					} else {
						this.layerMunicipalities.overrideStyle(feature, { visible: false });
					}
				});

				this.map.setZoom(7);
			}
		});

		this.randomDashboard();
	}

	onStateDeselect() {
		this.idStateSelected = "";
		this.idCitySelected = "";
		this.citiesDropDownList = [];
		this.citiesSelected = [];
		this.centerMap();
		this.layerStates.revertStyle(this.selectedFeature);

		this.layerStates.forEach(feature => {
			this.layerStates.revertStyle(feature);
		});
		this.layerMunicipalities.forEach(feature => {
			this.layerMunicipalities.revertStyle(feature);
		});
		this.randomDashboard();
	}

	onCitySelect() {
		this.States.states.forEach(state => {
			if (this.statesSelected[0] == state.name) {
				state.municipalities.forEach(municipality => {
					if (this.citiesSelected[0] == municipality.name) {
						this.map.setCenter({ lat: municipality.lat, lng: municipality.lng });
						this.map.setZoom(8);
						this.idCitySelected = municipality.code;
						return;
					}
				});
			}
		});
		this.randomDashboard();
	}

	onCityDeselect() {
		this.idCitySelected = "";
		this.randomDashboard();
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
		let startYear = 2010;
		this.intervalID = setInterval(function () {
			self.scrollBarValue = startYear;
			startYear = startYear + 1;
			self.randomDashboard();
			if (startYear > 2020) {
				clearInterval(self.intervalID);
			}
		}, 1000);
	}

	pauseTimer() {
		clearInterval(this.intervalID);
	}

	scrollBarChange(event: MatSliderChange) {
		this.scrollBarValue = event.value;
		this.randomDashboard();
	}

	updateCharts() {
		this.charts.forEach((chart) => {
			chart.update();
		});
	}

	randomKPIValues() {
		this._KPI.forEach((item) => {
			item.totalCases = Number((100 * Math.random()).toFixed(0));
			item.totalCasesTendency = Number((20 * Math.random() - 10).toFixed(1));
			item.indicator = Number((100 * Math.random()).toFixed(0));
			item.indicatorTendency = Number((20 * Math.random() - 10).toFixed(1));
		});
	}

	randomCharts() {

		for (let i = 0; i < this.monthlyData[0].data.length; i++) {
			this.monthlyData[0].data[i] = Math.floor(100 * Math.random());
			this.monthlyData[1].data[i] = Math.floor(100 * Math.random());
			this.monthlyData[2].data[i] = Math.floor(100 * Math.random());
		}



		this.weeklyData = [];
		this.weeklyLabels = [];
		let data = [];
		let startDate = getFirstSunday(this.scrollBarValue);
		let nowDate = new Date();
		for (let i = 0; i < 53; i++) {
			let valueDate = addDays(startDate, i * 7);
			if (valueDate.getFullYear() <= this.scrollBarValue && valueDate <= nowDate) {
				this.weeklyLabels.push(valueDate);
				data.push(Math.floor(20 * Math.random() + 1));
			}
			else {
				break;
			}
		}
		this.weeklyData = [
			{ data: data, label: 'Dengue' },
			{ data: data, label: 'Hemorrhagic Dengue' },
			{ data: data, label: 'Deaths by Dengue' }
		];



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

		this.updateCharts();
	}

	randomMapValues() {
		this.layerStates.forEach(feature => {
			feature.setProperty('Value', Math.floor(Math.random() * 200))
		});
		this.layerMunicipalities.forEach(feature => {
			feature.setProperty('Value', Math.floor(Math.random() * 200))
		});
		this.minLegendValue = 0;
		this.maxLegendValue = 200;
	}

	randomDashboard() {
		this.randomMapValues();
		this.randomKPIValues();
		this.randomTable();
		this.randomDengometer();
		this.randomCharts();
	}

	randomTable() {
		this.MunicipalitiesTable = [];

		this.States.states.forEach(state => {
			state.municipalities.forEach(municipality => {
				let randomValueIncidence = Math.floor(600 * Math.random());
				let randomValueLethality = Math.floor(25 * Math.random());
				this.MunicipalitiesTable.push(new MunicipalityTable(state.name, municipality.name, randomValueIncidence, randomValueLethality))
			})
		});

		this.MunicipalitiesTable.sort((a, b) => (a.incidence < b.incidence) ? 1 : -1);
		this.dataSource.data = this.MunicipalitiesTable;
	}

	randomDengometer() {
		let randomValue = Math.floor(1000 * Math.random());
		let color = 'green';
		if (randomValue > 750) {
			color = 'red';
		} else if (randomValue > 500) {
			color = 'orange';
		} else if (randomValue > 250) {
			color = '#FFDB58';
		}
		document.getElementById('dengometer-icon').style.color = color;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
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
