import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '../material-module';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ChartsModule } from 'ng2-charts';
import { ApiBackendService } from "../services/api-backend.service";
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
	let component: DashboardComponent;
	let fixture: ComponentFixture<DashboardComponent>;
	let tempG;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				ApiBackendService
			],
			declarations: [
				DashboardComponent
			],
			imports: [
				MaterialModule,
				FontAwesomeTestingModule,
				FormsModule,
				ReactiveFormsModule,
				NgMultiSelectDropDownModule,
				ChartsModule,
				HttpClientModule,
				GoogleMapsModule,
				BrowserAnimationsModule
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DashboardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
