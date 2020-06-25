import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  map: google.maps.Map;
  mapZoom = 6;
  mapCenter:google.maps.LatLngLiteral = {
    lat: 4.5709,
    lng: -74.2973
  };
  mapOptions: google.maps.MapOptions = {
    zoomControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    streetViewControl: false,
    zoom: 6,
    maxZoom: 7,
    minZoom: 5,
    mapTypeControl: false,
    center: {
      lat: 4.5709,
      lng: -74.2973
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  }

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
    this.Indicators1.forEach((value)=>{
      this.Indicators.push(value);
    });
    this.Indicators2.forEach((value)=>{
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

  initializeCharts(){
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
      { data: [5, 8, 50, 13], label: 'Laboratory confirmed'},
      { data: [16, 25, 80, 5], label: 'Epidemiological'},
      { data: [5, 5, 150, 30], label: 'Probable'},
      { data: [2, 3, 15, 8], label: 'Deaths'}
    ];
  }

  initializeMap(){
    let map = new google.maps.Map(document.getElementById('map'), this.mapOptions);
    map.data.loadGeoJson('assets/Colombia.geo.json');
    map.data.setStyle(function(feature) {
      var color = 'red';
      if (feature.getProperty('isColorful')) {
        color = feature.getProperty('color');
      }
      return ({
        fillColor: color,
        strokeColor: color,
        strokeWeight: 2
      });
    });
    
    map.data.addListener('click', function(event) {
      event.feature.setProperty('isColorful', true);
    });

    map.data.addListener('mouseover', function(event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, {strokeWeight: 5});
    });
    
    map.data.addListener('mouseout', function(event) {
      map.data.revertStyle();
    });
    this.map = map;
  }

  addValue(){
    this.labels.push('Added');
    this.data[0].data.push(100 * Math.random());
    this.data[1].data.push(100 * Math.random());
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