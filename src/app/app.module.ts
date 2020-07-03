import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { AboutComponent } from './about/about.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './error/error.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './home/home.component';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faHome, faUsers, faThermometerThreeQuarters, faCloudRain, faCloudShowersHeavy, faExclamationTriangle,
	 faExclamationCircle, faSkullCrossbones, faChartLine, faChartBar, faPlay, faPause, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { MaterialModule } from './material-module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
	declarations: [
		AppComponent,
		MenuComponent,
		AboutComponent,
		DashboardComponent,
		ErrorComponent,
		HomeComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FontAwesomeModule,
		BrowserAnimationsModule,
		NgbModule,
		MaterialModule,
		HttpClientModule,
		ChartsModule,
		GoogleMapsModule,
		NgMultiSelectDropDownModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [
		{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(private library: FaIconLibrary) {
		library.addIcons(faHome, faUsers, faThermometerThreeQuarters, faCloudRain, faCloudShowersHeavy, faExclamationTriangle,
			 faExclamationCircle, faSkullCrossbones, faChartLine, faChartBar, faPlay, faPause, faCaretUp, faCaretDown);
	}
}
