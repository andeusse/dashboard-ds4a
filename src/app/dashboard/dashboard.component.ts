import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { States } from "../data-structure/departmens-municipalities"
import { StatesJsonService } from "../services/states-json.service";
import { Indicator } from '../data-structure/indicator';
import { top10Mun } from '../data-structure/top10-mun';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	@ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective>;

	intervalID: NodeJS.Timeout;
	
	States: States = new States();

	map: google.maps.Map;
	mapInfoWindow: google.maps.InfoWindow;
	mapMarker: google.maps.Marker;
	minLegendValue: number = 0;
	maxLegendValue: number = 200;
	scrollBarValue: number;
	selectedFeature: google.maps.Data.Feature;

	displayedColumns: string[] = ['municipality', 'value'];

	statesDropDownList: Array<string>;
	statesSelected: Array<string> = [];
	statesDropdownSettings: IDropdownSettings;
	statesDropDownListPlaceHolder = 'Select a state';

	citiesDropDownList: Array<string>;
	citiesSelected: Array<string> = [];
	citiesDropdownSettings: IDropdownSettings;
	citiesDropDownListPlaceHolder = 'Select a city';

	_KPI: Array<Indicator> = [];
	Top10Municipalities: Array<top10Mun> = [];
	dataSource = new MatTableDataSource<top10Mun>([]);

	labels = [];
	labels3 = [];
	data = [];
	data3 = [];
	legends = true;
	options = {};
	type = 'bar';
	type2 = 'line';
	type3 = 'horizontalBar';

	public chartColors = [{
		backgroundColor: 'transparent',
		borderColor: 'transparent',
		pointBackgroundColor: '#ff0000',
		pointHoverBackgroundColor: '#0000ff',
		pointHoverBorderColor: '#ff0000'
	}];

	constructor(private StatesJsonService: StatesJsonService,) {
	}

	ngOnInit(): void {
		this.initializeKPI();
		this.initializeCharts();
		this.initializeMap();
		this.initializeDropDownStates();
		this.initializeDropDownCities();
		this.scrollBarValue = 2020;
	}

	initializeKPI() {
		let temp = new Indicator(0, "Dengue", 100, 2.1, "exclamation-triangle");
		this._KPI.push(temp);
		temp = new Indicator(1, "Hemorrhagic Dengue", 100, -5, "exclamation-triangle");
		this._KPI.push(temp);
		temp = new Indicator(2, "Deaths by Dengue", 100, 8, "skull-crossbones");
		this._KPI.push(temp);
	}

	initializeCharts() {
		this.options = {
			scaleShowVerticalLines: false,
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'top',
			},
		};
		this.labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
		this.labels3 = ['0 - 4', '5 - 17', '18 - 59', '60+']
		this.legends = true;
		this.data = [
			{ data: [65, 59, 80, 81, 56, 55, 40, 65, 53, 3, 43, 34], label: 'Series A', fill: false },
			{ data: [28, 48, 40, 19, 86, 27, 90, 12, 12, 54, 56, 34], label: 'Series B' }
		];
		this.data3 = [
			{ data: [5, 8, 50, 13], label: 'Laboratory confirmed' },
			{ data: [16, 25, 80, 5], label: 'Epidemiological' },
			{ data: [5, 5, 150, 30], label: 'Probable' },
			{ data: [2, 3, 15, 8], label: 'Deaths' }
		];
	}

	initializeMap() {
		let self = this;
		this.mapInfoWindow = new google.maps.InfoWindow({ disableAutoPan: true });
		let infowindow = this.mapInfoWindow;
		let mapOptions: google.maps.MapOptions = {
			zoomControl: false,
			scrollwheel: true,
			disableDoubleClickZoom: true,
			streetViewControl: false,
			fullscreenControl: false,
			zoom: 5,
			maxZoom: 7,
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

		this.map.data.loadGeoJson('assets/Colombia.geo.json', { idPropertyName: 'State' }, function (features) {
			// for(let i = 0; i < features.length; i++){
			// 	features[i].setProperty('Value', Math.floor(Math.random() * 200));
			// }
			self.randomMapValues();
		});

		this.map.data.setStyle(function (feature) {
			let color = [];
			let value = feature.getProperty('Value');
			if (!isNaN(value)) {
				let low = [151, 83, 34];
				let high = [5, 69, 54];
				let delta = (value - self.minLegendValue) / (self.maxLegendValue - self.minLegendValue);
				for (var i = 0; i < 3; i++) {
					color[i] = (high[i] - low[i]) * delta + low[i];
				}
			}
			else {
				color = [255, 255, 255];
			}
			return ({
				fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
				strokeColor: 'white',
				fillOpacity: 0.5,
				strokeWeight: 1,
				strokeOpacity: 1
			});
		});

		this.map.data.addListener('click', function (event) {
			self.map.setCenter(event.feature.getProperty('Center'));
			self.map.setZoom(7);
			self.statesSelected = [];
			self.statesSelected[0] = event.feature.getProperty('Name');
			self.onStateSelect();
			self.map.data.revertStyle(self.selectedFeature);
		});

		this.map.data.addListener('mouseover', function (event) {
			self.map.data.overrideStyle(event.feature, { strokeWeight: 5 });
			let center: google.maps.LatLngLiteral = {
				lat: event.feature.getProperty('Center').lat,
				lng: event.feature.getProperty('Center').lng
			};
			// infowindow = new google.maps.InfoWindow();
			// infowindow.setContent(self.buildInfoWindowsHTML(event.feature));
			// infowindow.setPosition(center);
			// infowindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
			// infowindow.open(self.map);
			var percent = (event.feature.getProperty('Value') - self.minLegendValue) / (self.maxLegendValue - self.minLegendValue) * 100;
			document.getElementById('data-label').textContent = event.feature.getProperty('Name');
			document.getElementById('data-value').textContent = event.feature.getProperty('Value').toLocaleString() + ' cases';
			document.getElementById('data-box').style.display = 'block';
			document.getElementById('data-caret').style.display = 'block';
			document.getElementById('data-caret').style.paddingLeft = percent + '%';
		});

		this.map.data.addListener('mouseout', function (event) {
			self.map.data.revertStyle(event.feature);
			// infowindow.close();
			document.getElementById('data-box').style.display = 'none';
			document.getElementById('data-caret').style.display = 'none';
		});
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
		if(this.selectedFeature){
			this.map.data.revertStyle(this.selectedFeature);
		}
		this.citiesDropDownList = [];
		this.citiesSelected = [];
		this.States.states.forEach(state => {
			if (this.statesSelected[0] == state.name) {
				this.selectedFeature = this.map.data.getFeatureById(state.code);
				let center = this.selectedFeature.getProperty('Center');
				this.map.setCenter(center);
				this.map.setZoom(7);
				this.map.data.overrideStyle(this.selectedFeature, { strokeWeight: 5 });
				state.municipalities.forEach(municipality => {
					this.citiesDropDownList.push(municipality.name);
				});
			}
		});
		this.randomValues();
	}

	onStateDeselect() {
		this.citiesDropDownList = [];
		this.citiesSelected = [];
		this.centerMap();
		this.map.data.revertStyle(this.selectedFeature);
		this.mapMarker.setMap(null);
	}

	onCitySelect() {
		if(this.mapMarker){
			this.mapMarker.setMap(null);
		}
		this.States.states.forEach(state => {
			if (this.statesSelected[0] == state.name) {
				state.municipalities.forEach(municipality => {
					if (this.citiesSelected[0] == municipality.name){
						this.map.setZoom(7);
						let center = {
							lat: municipality.lat,
							lng: municipality.lng
						};
						this.mapMarker = new google.maps.Marker({
							position: center,
							map: this.map
						});
					}
				});
			}
		});
	}

	onCityDeselect() {
		this.mapMarker.setMap(null);
	}

	centerMap() {
		this.map.setCenter({ lat: 4.5709, lng: -74.2973 });
		this.map.setZoom(5);
	}

	playTimer() {
		if(this.intervalID){
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

	scrollBarChange() {
		this.randomDashboard();
	}

	updateCharts() {
		this.charts.forEach((chart) => {
			chart.update();
		});
	}

	randomValues() {
		this._KPI.forEach((item) => {
			item.value = Number((100 * Math.random()).toFixed(0));
			item.tendency = Number((20 * Math.random() - 10).toFixed(1));
		});
		for (let i = 0; i < this.data[0].data.length; i++) {
			this.data[0].data[i] = 100 * Math.random();
			this.data[1].data[i] = 100 * Math.random();
		}
		for (let i = 0; i < this.data3[0].data.length; i++) {
			this.data3[0].data[i] = 100 * Math.random();
			this.data3[1].data[i] = 100 * Math.random();
			this.data3[2].data[i] = 100 * Math.random();
			this.data3[3].data[i] = 100 * Math.random();
		}
		this.updateCharts();
	}

	randomMapValues() {
		
		let statesArray = ["91", "05", "81", "08", "11", "13", "15", "17", "18", "85", "19", "20", "27", "23", "25",
		"94", "44", "95", "41", "47", "50", "52", "54", "86", "63", "66", "88", "68", "70", "73", "76", "97", "99"];

		let values = [];
		for (let i = 0; i < statesArray.length; i++) {
			values.push(Math.floor(Math.random() * 200));
		}
		for (let i = 0; i < statesArray.length; i++) {
			this.map.data.getFeatureById(statesArray[i]).setProperty('Value', values[i]);
		}
		this.minLegendValue = Math.min(...values);
		this.maxLegendValue = Math.max(...values);
	}

	randomDashboard() {
		this.randomMapValues();
		this.randomValues();
		this.randomTable();
	}

	randomTable(){
		this.Top10Municipalities = [];
		for(let i = 0; i < 10; i++){
			let randomStateNumber = Math.floor(this.States.states.length * Math.random());
			let randomMunNumber = Math.floor(this.States.states[randomStateNumber].municipalities.length * Math.random());
			let randomMun = this.States.states[randomStateNumber].municipalities[randomMunNumber].name;
			let randomValue = Math.floor(180 * Math.random() + 20);
			this.Top10Municipalities.push(new top10Mun(this.States.states[randomStateNumber].name, randomMun, randomValue))
		}
		this.Top10Municipalities.sort((a, b) => (a.value < b.value) ? 1 : -1);
		this.dataSource.data = this. Top10Municipalities;
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
	
	addValue() {
		this.labels.push('Added');
		this.data[0].data.push(100 * Math.random());
		this.data[1].data.push(100 * Math.random());

		this.map.data.getFeatureById("05").setProperty('AfterClickColor', true);
		this.map.data.getFeatureById("05").setProperty('Color', 'blue');

	}

}
