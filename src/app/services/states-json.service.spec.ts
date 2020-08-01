import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { StatesJsonService } from './states-json.service';

describe('StatesJsonService', () => {
  let service: StatesJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [StatesJsonService]
    });
    service = TestBed.inject(StatesJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
