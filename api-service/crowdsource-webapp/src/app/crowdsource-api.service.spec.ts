import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CrowdsourceApiService } from './crowdsource-api.service';

describe('CrowdsourceApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
    providers: [
      CrowdsourceApiService
    ]
  }));

  it('should be created', () => {
    const service: CrowdsourceApiService = TestBed.get(CrowdsourceApiService);
    expect(service).toBeTruthy();
  });
});
