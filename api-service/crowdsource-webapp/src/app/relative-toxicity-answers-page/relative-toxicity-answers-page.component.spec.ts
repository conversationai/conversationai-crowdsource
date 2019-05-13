import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterTestingModule } from '@angular/router/testing';
import { CrowdsourceApiService } from '../crowdsource-api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ActivatedRouteStub } from '../activated-route-stub';

import { RelativeToxicityAnswersPageComponent } from './relative-toxicity-answers-page.component';
import { AnswersDistributionChartComponent } from '../answers-distribution-chart/answers-distribution-chart.component';

describe('RelativeToxicityAnswersPageComponent', () => {
  let component: RelativeToxicityAnswersPageComponent;
  let fixture: ComponentFixture<RelativeToxicityAnswersPageComponent>;
  let activatedRoute: ActivatedRouteStub;

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey'
    };
    TestBed.configureTestingModule({
      declarations: [
        AnswersDistributionChartComponent,
        RelativeToxicityAnswersPageComponent
      ],
      imports: [
        DragDropModule,
        FormsModule,
        HttpClientTestingModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatRadioModule,
        MatSlideToggleModule,
        RouterTestingModule.withRoutes(
          [
              {
                path: 'relative_toxicity_job/answers/:clientJobKey',
                component: RelativeToxicityAnswersPageComponent
              },
          ]
        )
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        CrowdsourceApiService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelativeToxicityAnswersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
