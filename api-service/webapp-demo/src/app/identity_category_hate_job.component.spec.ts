import { Component, Injectable, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { HttpClientModule, HttpRequest } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatInputModule,
  MatTabsModule,
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseJobComponent } from './base_job.component';
import { IdentityCategoryHateJobComponent } from './identity_category_hate_job.component';
import { CrowdSourceApiService } from './crowd_source_api.service';

// Test component wrapper for BaseJobComponent.
@Component({
  selector: 'base-job-test',
  template: `<identity-category-hate-job [identities]="testIdentities"></identity-category-hate-job>`
})
class IdentityCategoryHateJobTestComponent {
  @ViewChild(IdentityCategoryHateJobComponent)
  identityJobComponent: IdentityCategoryHateJobComponent;

  testIdentities: string[];

  setTestIdentities(identities: string[]) {
    this.testIdentities = identities;
  }
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

// A stub class that implements ParamMap.
class ParamMapStub implements ParamMap {
  constructor(private params: {[key: string]: string}) {}
  has(name: string): boolean {
    return this.params.hasOwnProperty(name);
  }
  get(name: string): string | null {
    return this.params[name];
  }

  getAll(name: string): string[] {
    return [this.params[name]];
  }

  get keys(): string[] {
    let objKeys = [];
    for(let key in this.params) {
      objKeys.push(key);
    }
    return objKeys;
  }
}

function setupQuestionMocks(httpMock: HttpTestingController,
                            customClientJobKey: string) {
  // Verify the call to load a question.
  httpMock.expectOne('/api/work/' + customClientJobKey).flush([{
    question_id: 'foo',
    question: {id: 'bar', text: 'Hello world!'},
    answers_per_question: 10,
    answer_count: 5
  }]);
}

function verifyQualityApiCalls(httpMock: HttpTestingController) {
  // Verify job quality call.
  httpMock.expectOne('/api/job_quality').flush({
    toanswer_count: 50,
    toanswer_mean_score: 2
  });

  // Verify worker quality call.
  httpMock.expectOne((req: HttpRequest<any>): boolean => {
    const workerQualityRequestUrlRegExp = /\/api\/quality\/?(\w+)?/;
    const match = workerQualityRequestUrlRegExp.exec(req.urlWithParams);
    return match !== null;
  }).flush({
    answer_count: 20,
    mean_score: 1.5
  });
}

let activatedRoute: ActivatedRouteStub;

describe('IdentityCategoryHateJobComponent tests', () => {
  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {};
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        HttpClientTestingModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatInputModule,
        MatTabsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(
          [
              {
                path: 'identity_category_hate_job',
                component: IdentityCategoryHateJobComponent
              },
              {
                path: 'identity_category_hate_job/:customClientJobKey',
                component: IdentityCategoryHateJobComponent
              },
          ]
        )
      ],
      declarations: [
        IdentityCategoryHateJobTestComponent,
        IdentityCategoryHateJobComponent,
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        CrowdSourceApiService,
      ]
    }).compileComponents();
  }));

  it('should create the component', async(() => {
    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    const element = fixture.debugElement.componentInstance;
    expect(element).toBeTruthy();

    expect(fixture.nativeElement.textContent).not.toContain(
      'Add your own template to extend the BaseJob component');
  }));

  it('Displays question', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading');

    setupQuestionMocks(httpMock, 'testJobKey');

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hello world!');
  }))));

  // TODO(rachelrosen): Maybe split this up into separate tests?
  it('UI interaction for boolean labels tab', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.componentInstance.setTestIdentities(["cats", "dogs", "rabbits"]);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey');
    fixture.detectChanges();

    const jobComponent = fixture.componentInstance.identityJobComponent;

    const tabs = fixture.debugElement.query(By.css('#tabGroup')).componentInstance;
    expect(tabs.selectedIndex).toEqual(0);

    // Checks that the question for all identities are displayed.
    const questions = fixture.debugElement.queryAll(By.css('.identityQuestion'));
    expect(questions.length).toEqual(3);
    let hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(0);

    // Checks that questions about hate are displayed after clicking the
    // checkboxes for the questions.
    // Note: calling toggle() on the componentInstance does not update the
    // template in the test, and calling click() on the nativeElement also has
    // no effect. This is true when after calling whenStable().
    // TODO(rachelrosen): Investigate why this happens.
    questions[0].nativeElement.querySelector('input').click();
    questions[2].nativeElement.querySelector('input').click();
    fixture.detectChanges();

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(2);

    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: true, hateful: false},
      {category: 'dogs', markedAsCategory: false, hateful: false},
      {category: 'rabbits', markedAsCategory: true, hateful: false}
    ]);

    // Check the hateful label box for the first group.
    hateQuestions[0].nativeElement.querySelector('input').click();

    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: true, hateful: true},
      {category: 'dogs', markedAsCategory: false, hateful: false},
      {category: 'rabbits', markedAsCategory: true, hateful: false}
    ]);

    // Check the hateful label box for the third group.
    hateQuestions[1].nativeElement.querySelector('input').click();

    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: true, hateful: true},
      {category: 'dogs', markedAsCategory: false, hateful: false},
      {category: 'rabbits', markedAsCategory: true, hateful: true}
    ]);

    // Uncheck one of the selected checkboxes, and check that the hateful
    // question is hidden again and the hate value has been reset.
    questions[2].nativeElement.querySelector('input').click();
    fixture.detectChanges();
    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(1);

    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: true, hateful: true},
      {category: 'dogs', markedAsCategory: false, hateful: false},
      {category: 'rabbits', markedAsCategory: false, hateful: false}
    ]);
  }))));

  // TODO(rachelrosen): Write this test.
  xit('UI interaction for detailed labels tab', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
  }))));
});
