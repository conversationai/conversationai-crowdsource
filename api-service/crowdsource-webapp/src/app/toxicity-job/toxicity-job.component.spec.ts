import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToxicityJobComponent } from './toxicity-job.component';

describe('ToxicityJobComponent', () => {
  let component: ToxicityJobComponent;
  let fixture: ComponentFixture<ToxicityJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToxicityJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToxicityJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
