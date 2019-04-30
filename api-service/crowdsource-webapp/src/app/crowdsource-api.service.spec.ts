import { TestBed } from '@angular/core/testing';

import { CrowdsourceApiService } from './crowdsource-api.service';

describe('CrowdsourceApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrowdsourceApiService = TestBed.get(CrowdsourceApiService);
    expect(service).toBeTruthy();
  });
});
