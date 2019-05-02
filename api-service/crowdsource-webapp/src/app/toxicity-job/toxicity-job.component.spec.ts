import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterTestingModule } from '@angular/router/testing';
import { CrowdsourceApiService } from '../crowdsource-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ActivatedRouteStub } from '../activated-route-stub';

import { ToxicityJobComponent } from './toxicity-job.component';

describe('ToxicityJobComponent', () => {
  let component: ToxicityJobComponent;
  let fixture: ComponentFixture<ToxicityJobComponent>;
  let activatedRoute: ActivatedRouteStub;

  console.log('Start of test ToxicityJobComponent');

  beforeEach(async(() => {
    console.log('beforeEach: Start of test ToxicityJobComponent');
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey'
    };
    TestBed.configureTestingModule({
      declarations: [ ToxicityJobComponent ],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        MatCheckboxModule,
        MatIconModule,
        MatFormFieldModule,
        MatRadioModule,
        MatSlideToggleModule,
        RouterTestingModule.withRoutes(
          [
              {
                path: 'toxicity_job',
                component: ToxicityJobComponent
              },
              {
                path: 'toxicity_job/:clientJobKey',
                component: ToxicityJobComponent
              },
          ]
        )
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        CrowdsourceApiService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    console.log('in before each');
    fixture = TestBed.createComponent(ToxicityJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log('in should create');
    expect(component).toBeTruthy();
  });
});
