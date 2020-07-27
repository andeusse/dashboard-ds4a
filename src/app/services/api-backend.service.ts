import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CountryAPI, StateCityAPI, CityTables, StateTables } from '../data-structure/api';

@Injectable({
	providedIn: 'root'
})
export class ApiBackendService {

	private host: string = "http://localhost:5000/";

	private urlGetCountry: string = this.host;
	private urlGetState:string = this.host + "?state_id={0}";
	private urlGetCity:string = this.host + "?city_id={0}";
	private urlGetTableCity:string = this.host + "table/city";
	private urlGetTableState:string = this.host + "table/state";

	headers = new HttpHeaders();

	constructor(private httpClient: HttpClient) {
        this.headers.append('Access-Control-Allow-Headers', 'Content-Type');
        this.headers.append('Access-Control-Allow-Methods', 'GET');
        this.headers.append('Access-Control-Allow-Origin', '*');
	}

	getCountryValues(){
		let urlTemp = this.urlGetCountry;
		return this.httpClient.get<CountryAPI>(urlTemp, {headers: this.headers}).toPromise();
	}

	getStateValues(state: string){
		let urlTemp = this.FormatString(this.urlGetState, state);
		return this.httpClient.get<StateCityAPI>(urlTemp).toPromise();
	}

	getCityValues(city: string){
		let urlTemp = this.FormatString(this.urlGetCity, city);
		return this.httpClient.get<StateCityAPI>(urlTemp).toPromise();
	}

	getTableCityValues(){
		let urlTemp = this.urlGetTableCity;
		return this.httpClient.get<CityTables>(urlTemp).toPromise();
	}

	getTableStateValues(){
		let urlTemp = this.urlGetTableState;
		return this.httpClient.get<StateTables>(urlTemp).toPromise();
	}

	FormatString(str: string, ...val: string[]) {
		for (let index = 0; index < val.length; index++) {
		  str = str.replace(`{${index}}`, val[index]);
		}
		return str;
	  }
}
