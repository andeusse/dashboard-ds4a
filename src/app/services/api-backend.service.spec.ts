import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ApiBackendService } from './api-backend.service';

describe('ApiBackendService', () => {
  let service: ApiBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ApiBackendService]
    });
    service = TestBed.inject(ApiBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
