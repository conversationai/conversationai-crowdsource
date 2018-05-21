import { Component, Injectable, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { BaseJobComponent } from './base_job.component';
import { TestQuestionFilterComponent } from './test_question_filter.component';
import { CrowdSourceApiService } from './crowd_source_api.service';
import { ActivatedRouteStub, setupQuestionMocks } from './test_util';

@Component({
  selector: 'base-job-test',
  template: `<test-question-filter></test-question-filter>`
})
class TestQuestionFilterTestComponent {
  @ViewChild(TestQuestionFilterComponent)
  testQuestionFilterComponent: TestQuestionFilterComponent;
}

function verifyBuildsAnswerOnButtonClick(httpMock: HttpTestingController,
                                         buttonId: string,
                                         expectedAnswer: string) {
  activatedRoute.testParams = {
    customClientJobKey: 'testJobKey'
  };

  const fixture = TestBed.createComponent(TestQuestionFilterTestComponent);
  fixture.detectChanges();
  setupQuestionMocks(httpMock, 'testJobKey', fixture);

  fixture.debugElement.query(By.css('#' + buttonId)).nativeElement.click();

  const jobComponent = fixture.componentInstance.testQuestionFilterComponent;
  expect(jobComponent.buildAnswer().testQuestionEval).toEqual(expectedAnswer);
}

let activatedRoute: ActivatedRouteStub;

describe('TestQuestionFilterComponent tests', () => {
  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {};
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(
          [
              {
                path: 'test_question_filter',
                component: TestQuestionFilterComponent
              },
              {
                path: 'test_question_filter/:customClientJobKey',
                component: TestQuestionFilterComponent
              },
          ]
        )
      ],
      declarations: [
        TestQuestionFilterTestComponent,
        TestQuestionFilterComponent,
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        CrowdSourceApiService,
      ]
    }).compileComponents();
  }));

  it('Builds yes answer', async((inject([HttpTestingController], (httpMock: HttpTestingController) => {
    verifyBuildsAnswerOnButtonClick(httpMock, 'yesButton', 'yes');
  }))));

  it('Builds no answer', async((inject([HttpTestingController], (httpMock: HttpTestingController) => {
    verifyBuildsAnswerOnButtonClick(httpMock, 'noButton', 'no');
  }))));

  it('Builds not sure answer', async((inject([HttpTestingController], (httpMock: HttpTestingController) => {
    verifyBuildsAnswerOnButtonClick(httpMock, 'notSureButton', 'not_sure');
  }))));
});
