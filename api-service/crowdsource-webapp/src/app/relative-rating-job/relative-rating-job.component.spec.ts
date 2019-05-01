import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeRatingJobComponent } from './relative-rating-job.component';

describe('RelativeRatingJobComponent', () => {
  let component: RelativeRatingJobComponent;
  let fixture: ComponentFixture<RelativeRatingJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelativeRatingJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelativeRatingJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
