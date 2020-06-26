import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	colormap = require('colormap');

	map: google.maps.Map;
	mapOptions: google.maps.MapOptions = {
		zoomControl: false,
		scrollwheel: true,
		disableDoubleClickZoom: true,
		streetViewControl: false,
		zoom: 5,
		maxZoom: 7,
		minZoom: 5,
		mapTypeControl: false,
		center: {
			lat: 4.5709,
			lng: -74.2973
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#000000'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
        ]
	}
	mapInfoWindow: google.maps.InfoWindow = new google.maps.InfoWindow({
		disableAutoPan:true
	});

	displayedColumns: string[] = ['icon', 'name', 'value', 'unit'];

	Indicators: Array<Indicator> = [];
	Indicators1: Array<Indicator> = [];
	Indicators2: Array<Indicator> = [];
	dataSource = new MatTableDataSource<Indicator>([]);

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

	constructor() {
		this.initializeIndicator1();
		this.initializeIndicator2();
		this.Indicators1.forEach((value) => {
			this.Indicators.push(value);
		});
		this.Indicators2.forEach((value) => {
			this.Indicators.push(value);
		});
		this.dataSource.data = this.Indicators;
	}

	initializeIndicator1() {
		let temp = new Indicator(0, "Laboratory confirmed", 100, "exclamation-circle", "-");
		this.Indicators1.push(temp);
		temp = new Indicator(1, "Epidemiological link", 100, "exclamation-circle", "-");
		this.Indicators1.push(temp);
		temp = new Indicator(2, "Probable", 100, "exclamation-circle", "-");
		this.Indicators1.push(temp);
		temp = new Indicator(3, "Confirmed deaths", 100, "skull-crossbones", "-");
		this.Indicators1.push(temp);
	}

	initializeIndicator2() {
		let temp = new Indicator(4, "Temperature", 100, "thermometer-three-quarters", " °C");
		this.Indicators2.push(temp);
		temp = new Indicator(5, "Precipitation", 100, "cloud-rain", " mm");
		this.Indicators2.push(temp);
		temp = new Indicator(6, "Humidity", 100, "cloud-showers-heavy", " %");
		this.Indicators2.push(temp);
		temp = new Indicator(7, "Prob dengue outbreak", 100, "exclamation-triangle", " %");
		this.Indicators2.push(temp);
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
			{ data: [65, 59, 80, 81, 56, 55, 40, 65, 53, 3, 43, 34], label: 'Series A' },
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
		let infowindow = this.mapInfoWindow;
		let map = new google.maps.Map(document.getElementById('map'), this.mapOptions);

		let valuesArray = [];
		for (let i = 0; i < 33; i++){
			valuesArray.push(100 * Math.random());
		}
		let nshades = Math.max(...valuesArray) - Math.min(...valuesArray);
		
		let colors = this.colormap({
			colormap: 'jet',
			nshades: nshades,
			format: 'hex',
			alpha: 1
		});
		console.log(colors);
		map.data.loadGeoJson('assets/Colombia.geo.json');

		map.data.setStyle(function (feature) {
			var color = 'red';
			if (feature.getProperty('afterClickColor')) {
				color = feature.getProperty('color');
			}
			if (feature.getProperty('State') == '05'){
				console.log('Antioquia Rulez');
			}
			return ({
				fillColor: color,
				// strokeColor: '#17263C',
				strokeColor: 'white',
				strokeWeight: 1,
				strokeOpacity: 0.5
			});
		});

		map.data.addListener('click', function (event) {
			// event.feature.setProperty('afterClickColor', true);
		});

		map.data.addListener('mouseover', function (event) {
			map.data.overrideStyle(event.feature, { strokeWeight: 5});
			let center: google.maps.LatLngLiteral = {
				lat: event.feature.getProperty('Center').lat,
				lng: event.feature.getProperty('Center').lng
			};

			infowindow = new google.maps.InfoWindow();
			infowindow.setContent(buildInfoWindowsHTML(event.feature));
			infowindow.setPosition(center);
			infowindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
			infowindow.open(map);

			function buildInfoWindowsHTML(feature: { getProperty: (arg0: string) => string | number; }) {
				let content = '';
				content = `<div class="text-center">
					<div class="bg-dark text-light card">  
					<div class="card-header text-center">
						<h4 class="my-0 font-weight-normal">`+ feature.getProperty('Name') + `</h4>
					</div>
					<div class="card-body text-center">
						<p class="card-title pricing-card-title">Area: ` + formatNumber((Number(feature.getProperty('Area')) / 1E6).toFixed(0)) + ` km<sup>2</sup></p>
					</div>
					</div>
					</div>`
				return content;
				function formatNumber(num: string) {
					return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
				}
			}
		});

		map.data.addListener('mouseout', function (event) {
			map.data.revertStyle(event.feature);
			infowindow.close();
		});
		this.map = map;
	}


	addValue() {
		this.labels.push('Added');
		this.data[0].data.push(100 * Math.random());
		this.data[1].data.push(100 * Math.random());
	}

	randomValues() {
		this.Indicators1.forEach((item) => {
			item.value = Number((100 * Math.random()).toFixed(2));
		});
		this.Indicators2.forEach((item) => {
			item.value = Number((100 * Math.random()).toFixed(2));
		});
		this.Indicators.forEach((item) => {
			item.value = Number((100 * Math.random()).toFixed(2));
		});
	}

	ngOnInit(): void {
		this.initializeCharts();
		this.initializeMap();
	}
}

export class Indicator {
	public id: number;
	public title: string;
	public value: number;
	public icon: string;
	public unit: string;
	constructor(id: number, title: string, value: number, icon: string = "", unit: string = "") {
		this.id = id;
		this.title = title;
		this.value = value;
		this.icon = icon;
		this.unit = unit;
	}
}