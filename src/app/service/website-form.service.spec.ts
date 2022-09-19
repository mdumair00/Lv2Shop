import { TestBed } from '@angular/core/testing';

import { WebsiteFormService } from '../service/website-form.service';

describe('WebsiteFormService', () => {
  let service: WebsiteFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsiteFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
