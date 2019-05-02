import { Component, Injectable, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { HttpClientModule, HttpRequest } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ParamMapStub } from './param_map_stub';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  BaseRequestOptions,
  Http,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseJobComponent } from './base_job.component';
import { CrowdSourceApiService } from './crowd_source_api.service';

// A simple Component that extends BaseJobComponent.
@Component({
  selector: 'my-job',
  template: `
    <div *ngIf="question !== null">{{questionId}} {{question.text}}</div>
    <button id="sendScoreButton" (click)="sendScoreToApi(questionId)">Send score</button>
  `
})
class MyJobComponent extends BaseJobComponent {
  clientJobKey = 'testJobKey';
  questionId = 'fooQuestion';
  routerPath = '/my_job';
}

// Test component wrapper for BaseJobComponent.
@Component({
  selector: 'base-job-test',
  template: "<base-job></base-job>"
})
class BaseJobTestComponent {
}

// Test component wrapper for MyJobComponent.
@Component({
  selector: 'base-job-extended-test',
  template: "<my-job></my-job>"
})
class BaseJobExtendedTestComponent {
  @ViewChild(MyJobComponent) myJobComponent: MyJobComponent;
}

// Stub for ActivatedRoute.
@Injectable()
class ActivatedRouteStub {
  private paramsSubject = new BehaviorSubject(this.testParams);
  paramMap = this.paramsSubject.asObservable();

  private stubTestParams: ParamMap;
  get testParams() {
    return this.stubTestParams;
  }
  set testParams(params: {}) {
    this.stubTestParams = new ParamMapStub(params);
    this.paramsSubject.next(this.stubTestParams);
  }
}

// TODO(rachelrosen): Currently we have to expect every http call in order to
// be able to call .verify() at the end; investigate if there is another way
// to "flush" the controller so that we don't have to check the job_quality
// and worker quality calls are made in every test where we want to use
// verify().
function verifyQualityApiCalls(httpMock: HttpTestingController, clientJobKey = 'testJobKey') {
  // Verify job quality call.
  httpMock.expectOne(`/client_jobs/${clientJobKey}/quality_summary`).flush({
    toanswer_count: 50,
    toanswer_mean_score: 2
  });

  // Verify worker quality call.
  httpMock.expectOne((req: HttpRequest<any>): boolean => {
    const workerQualityRequestUrlRegExp = /\/client_jobs\/(.*)\/workers\/.*\/quality_summary/;
    const match = workerQualityRequestUrlRegExp.exec(req.urlWithParams);
    console.log('request', req);
    if (match === null) {
      return false;
    }
    expect(match[1]).toEqual(clientJobKey);
    return match !== null;
  }).flush({
    answer_count: 20,
    mean_score: 1.5
  });
}

let activatedRoute: ActivatedRouteStub;

describe('BaseComponent', () => {
  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {};
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(
          [
              {
                path: 'my_job',
                component: MyJobComponent
              },
              {
                path: 'my_job/:clientJobKey',
                component: MyJobComponent
              },
          ]
        )
      ],
      declarations: [
        BaseJobComponent,
        BaseJobExtendedTestComponent,
        BaseJobTestComponent,
        MyJobComponent
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        CrowdSourceApiService,
      ]
    }).compileComponents();
  }));

  it('should create the component', async(() => {
    const fixture = TestBed.createComponent(BaseJobTestComponent);
    const element = fixture.debugElement.componentInstance;
    expect(element).toBeTruthy();

    expect(fixture.nativeElement.textContent).toContain(
      'Add your own template to extend the BaseJob component');
  }));

  it('Loads question', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    // Manually update the url params.
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey'
    };
    const fixture = TestBed.createComponent(BaseJobExtendedTestComponent);
    fixture.detectChanges();

    // Verify the call to load a question/
    httpMock.expectOne('/client_jobs/testJobKey/next10_unanswered_questions').flush([{
      question_id: 'foo',
      question: {id: 'bar', text: 'Hello world!'},
      answers_per_question: 10,
      answer_count: 5
    }]);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('foo');
    expect(fixture.nativeElement.textContent).toContain('Hello world!');

    verifyQualityApiCalls(httpMock);

    // Verify no outstanding requests.
    httpMock.verify();
  }))));

  it('Loads question with question id', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    // Manually update the url params.
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey',
      questionId: 'foo'
    };
    const fixture = TestBed.createComponent(BaseJobExtendedTestComponent);
    fixture.detectChanges();

    // Verify the call to load a question/
    httpMock.expectOne('/client_jobs/testJobKey/questions/foo').flush({
      question_id: 'foo',
      question: {id: 'bar', text: 'Hello world!'},
      answers_per_question: 10,
      answer_count: 5
    });

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('foo');
    expect(fixture.nativeElement.textContent).toContain('Hello world!');

    verifyQualityApiCalls(httpMock);

    // Verify no outstanding requests.
    httpMock.verify();
  }))));

  it('Sends score', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    // Manually update the url params.
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey'
    };
    const fixture = TestBed.createComponent(BaseJobExtendedTestComponent);
    fixture.detectChanges();

    // Loading the first question.
    httpMock.expectOne('/client_jobs/testJobKey/next10_unanswered_questions').flush([{
      question_id: 'foo',
      question: {id: 'bar', text: 'First question'},
      answers_per_question: 10,
      answer_count: 5
    }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('foo');
    expect(fixture.nativeElement.textContent).toContain('First question');

    verifyQualityApiCalls(httpMock);

    // Verify no outstanding requests.
    httpMock.verify();

    // Manually update the url params.
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey',
      questionId: 'foo'
    };

    const userNonce = fixture.componentInstance.myJobComponent.userNonce;
    fixture.debugElement.query(By.css('#sendScoreButton')).nativeElement.click();
    // Sending the score.
    httpMock.expectOne((req: HttpRequest<any>): boolean => {
      return req.urlWithParams === `/client_jobs/testJobKey/questions/foo/answers/`;
    }).flush({});

    // A new question should load after sending the score.
    httpMock.expectOne('/client_jobs/testJobKey/next10_unanswered_questions').flush([{
      question_id: 'testing',
      question: {id: 'abc', text: 'New question!'},
      answers_per_question: 10,
      answer_count: 5
    }]);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('testing');
    expect(fixture.nativeElement.textContent).toContain('New question!');

    verifyQualityApiCalls(httpMock);

    // Verify no outstanding requests.
    httpMock.verify();
  }))));

  it('Loading question error', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    // Manually update the url params.
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey'
    };
    const fixture = TestBed.createComponent(BaseJobExtendedTestComponent);
    fixture.detectChanges();

    // TODO(rachelrosen): Figure out how to set the message field in the test
    // such that we can check the exact error message sent (currently it nests
    // the text passed inside an error object, different from the
    // HttpErrorResponse the code gets outside of tests.
    httpMock.expectOne('/client_jobs/testJobKey/next10_unanswered_questions').error(new ErrorEvent('Oh no!'));

    fixture.detectChanges();
    expect(fixture.componentInstance.myJobComponent.errorMessage).toContain(
      'Http failure response for /client_jobs/testJobKey/next10_unanswered_questions');

    verifyQualityApiCalls(httpMock);

    // Verify no outstanding requests.
    httpMock.verify();
  }))));

  it('Sending score error', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    // Manually update the url params.
    activatedRoute.testParams = {
      clientJobKey: 'testJobKey',
      questionId: 'foo'
    };
    const fixture = TestBed.createComponent(BaseJobExtendedTestComponent);
    fixture.detectChanges();

    httpMock.expectOne('/client_jobs/testJobKey/questions/foo').flush({
      question_id: 'foo',
      question: {id: 'bar', text: 'First question'},
      answers_per_question: 10,
      answer_count: 5
    });

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('foo');
    expect(fixture.nativeElement.textContent).toContain('First question');

    verifyQualityApiCalls(httpMock);

    // Verify no outstanding requests.
    httpMock.verify();

    fixture.debugElement.query(By.css('#sendScoreButton')).nativeElement.click();

    // Sending the score.
    httpMock.expectOne((req: HttpRequest<any>): boolean => {
      return req.urlWithParams === `/client_jobs/testJobKey/questions/foo/answers/`;
    }).error(new ErrorEvent('Oh no!'));

    fixture.detectChanges();
    expect(fixture.componentInstance.myJobComponent.errorMessage).toContain(
      'Http failure response for /client_jobs/testJobKey/questions/foo/answers/');

    // No new question was loaded since there was an error.
    expect(fixture.nativeElement.textContent).toContain('foo');
    expect(fixture.nativeElement.textContent).toContain('First question');

    // Verify no outstanding requests.
    httpMock.verify();
  }))));
});
