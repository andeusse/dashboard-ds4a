import { Component, OnInit } from '@angular/core';
import { User, Users } from '../data-structure/users';

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

	users: Array<User> = [];

	constructor() {
		let user = new Users();
		this.users = user.users;
	}

	ngOnInit(): void {
	}
}
