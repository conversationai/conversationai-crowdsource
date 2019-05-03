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

import { RelativeToxicityJobComponent } from './relative-toxicity-job.component';

describe('RelativeToxicityJobComponent', () => {
  let component: RelativeToxicityJobComponent;
  let fixture: ComponentFixture<RelativeToxicityJobComponent>;
  let activatedRoute: ActivatedRouteStub;

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey'
    };
    TestBed.configureTestingModule({
      declarations: [ RelativeToxicityJobComponent ],
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
                path: 'relative_toxicity_job',
                component: RelativeToxicityJobComponent
              },
              {
                path: 'relative_toxicity_job/:clientJobKey',
                component: RelativeToxicityJobComponent
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
    fixture = TestBed.createComponent(RelativeToxicityJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
