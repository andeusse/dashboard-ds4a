import { TestBed } from '@angular/core/testing';

import { StatesJsonService } from './states-json.service';

describe('StatesJsonService', () => {
  let service: StatesJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatesJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
