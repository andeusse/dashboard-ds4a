import { TestBed } from '@angular/core/testing';

import { ApiBackendService } from './api-backend.service';

describe('ApiBackendService', () => {
  let service: ApiBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
