import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { States } from '../data-structure/states-cities';

@Injectable({
	providedIn: 'root'
})
export class StatesJsonService {

	constructor(private httpClient: HttpClient) { }

	getStates(){
		return this.httpClient.get<States>('assets/DepMun.json').toPromise();
	}
}
