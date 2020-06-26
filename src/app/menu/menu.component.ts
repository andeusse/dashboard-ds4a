import { Component, OnInit } from '@angular/core';
import { faHome, faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

	faHome = faHome;
	faUsers = faUsers;
	faChartLine = faChartLine;

	constructor() { }

	ngOnInit(): void {
	}

}
