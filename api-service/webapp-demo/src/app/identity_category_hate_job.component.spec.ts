import { Component, Injectable, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
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
import { ActivatedRouteStub, setupQuestionMocks } from './test_util';

const HATE_DETAIL_OPTION_COUNT = 5;
const DETAIL_TAB = 1;

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

function changeToTab(tabNumber: number, fixture: ComponentFixture<IdentityCategoryHateJobTestComponent>) {
  const tabs = fixture.debugElement.query(By.css('#tabGroup')).componentInstance;
  tabs.selectedIndex = tabNumber;
  fixture.detectChanges();
}

function getAllFalseHatefulDetailLabels(): {} {
  return {
    slurs: false,
    violence: false,
    false_accusations: false,
    other_hate: false
  }
};

function toggleCategoryBoxForItem(fixture: ComponentFixture<IdentityCategoryHateJobTestComponent>,
                                  index: number,
                                  tab = 0) {
  const questionSelector = tab === 0 ? '.identityQuestion' : '.detailedLabels .identityQuestion';
  const questions = fixture.debugElement.queryAll(By.css(questionSelector));
  // Note: calling toggle() on the componentInstance does not update the
  // template in the test, and calling click() on the nativeElement also has
  // no effect. This is true when after calling whenStable().
  // TODO(rachelrosen): Investigate why this happens.
  questions[index].nativeElement.querySelector('input').click();
  fixture.detectChanges();
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

    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hello world!');
  }))));

  it('Boolean labels: Shows hateful option when category checkbox is checked', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.componentInstance.setTestIdentities(["cats", "dogs"]);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    const jobComponent = fixture.componentInstance.identityJobComponent;

    const tabs = fixture.debugElement.query(By.css('#tabGroup')).componentInstance;
    expect(tabs.selectedIndex).toEqual(0);

    // Checks that the question for all identities are displayed.
    const questions = fixture.debugElement.queryAll(By.css('.identityQuestion'));
    expect(questions.length).toEqual(2);
    let hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(0);

    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: false, hateful: false},
      {category: 'dogs', markedAsCategory: false, hateful: false},
    ]);

    // Checks the category box for the first group.
    toggleCategoryBoxForItem(fixture, 0);

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(1);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: true, hateful: false},
      {category: 'dogs', markedAsCategory: false, hateful: false},
    ]);

    // Checks the category box for the second group.
    toggleCategoryBoxForItem(fixture, 1);

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(2);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: true, hateful: false},
      {category: 'dogs', markedAsCategory: true, hateful: false},
    ]);

    // Un-checks the category box for the first group.
    toggleCategoryBoxForItem(fixture, 0);

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(1);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: false, hateful: false},
      {category: 'dogs', markedAsCategory: true, hateful: false},
    ]);

    // Un-checks the category box for the second group.
    toggleCategoryBoxForItem(fixture, 1);

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(0);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'cats', markedAsCategory: false, hateful: false},
      {category: 'dogs', markedAsCategory: false, hateful: false},
    ]);
  }))));

  it('Boolean labels: Unchecking identity unchecks hate option', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.componentInstance.setTestIdentities(["foo"]);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    const jobComponent = fixture.componentInstance.identityJobComponent;
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'foo', markedAsCategory: false, hateful: false},
    ]);

    const questions = fixture.debugElement.queryAll(By.css('.identityQuestion'));

    // Checks the box for the first identity.
    toggleCategoryBoxForItem(fixture, 0);

    expect(questions[0].componentInstance.checked).toBe(true);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'foo', markedAsCategory: true, hateful: false},
    ]);

    let hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(1);

    // Checks the hateful box for the first identity.
    hateQuestions[0].nativeElement.querySelector('input').click();
    fixture.detectChanges();

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(1);
    expect(hateQuestions[0].componentInstance.checked).toBe(true);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'foo', markedAsCategory: true, hateful: true},
    ]);

    // Unchecks the box for the first identity.
    toggleCategoryBoxForItem(fixture, 0);

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions.length).toEqual(0);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'foo', markedAsCategory: false, hateful: false},
    ]);

    // Re-checks the box for the first identity.
    questions[0].nativeElement.querySelector('input').click();
    fixture.detectChanges();

    hateQuestions = fixture.debugElement.queryAll(By.css('.hatefulQuestion'));
    expect(hateQuestions[0].componentInstance.checked).toBe(false);
    expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
      {category: 'foo', markedAsCategory: true, hateful: false},
    ]);
  }))));

  it('Detailed labels: Unchecking identity unchecks all detail options', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };


    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.componentInstance.setTestIdentities(["foo"]);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    const jobComponent = fixture.componentInstance.identityJobComponent;
    changeToTab(DETAIL_TAB, fixture);
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'foo', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels()},
      ]);

      const questions = fixture.debugElement.queryAll(By.css('.detailedLabels .identityQuestion'));

      // Check the box for the identity.
      toggleCategoryBoxForItem(fixture, 0, DETAIL_TAB);

      expect(questions[0].componentInstance.checked).toBe(true);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'foo', markedAsCategory: true, hatefulLabels: getAllFalseHatefulDetailLabels() },
      ]);

      let hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));

      // Checks two of the hate detail options
      hateQuestions[0].nativeElement.querySelector('input').click();
      hateQuestions[1].nativeElement.querySelector('input').click();
      fixture.detectChanges();

      expect(hateQuestions[0].componentInstance.checked).toBe(true);
      expect(hateQuestions[1].componentInstance.checked).toBe(true);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: true,
          hatefulLabels: {
            slurs: true,
            violence: true,
            false_accusations: false,
            other_hate: false
          }
        },
      ]);

      // Uncheck the box for the identity.
      toggleCategoryBoxForItem(fixture, 0, DETAIL_TAB);

      hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));
      expect(hateQuestions.length).toEqual(0);
      expect(questions[0].componentInstance.checked).toBe(false);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'foo', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels() },
      ]);

      // Re-checks the box for the identity
      toggleCategoryBoxForItem(fixture, 0, DETAIL_TAB);

      hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));
      expect(hateQuestions[0].componentInstance.checked).toBe(false);
      expect(hateQuestions[1].componentInstance.checked).toBe(false);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'foo', markedAsCategory: true, hatefulLabels: getAllFalseHatefulDetailLabels()},
      ]);
    });
  }))));


  it('Detailed labels: Shows hateful detail options when category checkbox is checked', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const HATE_DETAIL_OPTION_COUNT = 5;

    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.componentInstance.setTestIdentities(["cats", "dogs"]);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    const jobComponent = fixture.componentInstance.identityJobComponent;

    const tabs = fixture.debugElement.query(By.css('#tabGroup')).componentInstance;
    expect(tabs.selectedIndex).toEqual(0);

    changeToTab(DETAIL_TAB, fixture);

    // Use whenStable() to wait for tab switching animation, otherwise the UI in
    // the rest of the test can get into an invalid state.
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(tabs.selectedIndex).toEqual(DETAIL_TAB);

      // Checks that the question for all identities are displayed.
      const questions = fixture.debugElement.queryAll(By.css('.detailedLabels .identityQuestion'));
      expect(questions.length).toEqual(2);
      let hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));
      expect(hateQuestions.length).toEqual(0);

      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'cats', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels() },
        { category: 'dogs', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels() },
      ]);

      // Check the box for the first identity.
      toggleCategoryBoxForItem(fixture, 0, DETAIL_TAB);

      hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));
      expect(hateQuestions.length).toEqual(HATE_DETAIL_OPTION_COUNT);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'cats', markedAsCategory: true, hatefulLabels: getAllFalseHatefulDetailLabels() },
        { category: 'dogs', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels() },
      ]);

      // Check the box for the second identity.
      toggleCategoryBoxForItem(fixture, 1, DETAIL_TAB);

      hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));
      expect(hateQuestions.length).toEqual(2 * HATE_DETAIL_OPTION_COUNT);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'cats', markedAsCategory: true, hatefulLabels: getAllFalseHatefulDetailLabels() },
        { category: 'dogs', markedAsCategory: true, hatefulLabels: getAllFalseHatefulDetailLabels() },
      ]);

      // Unchecks the box for the first identity.
      toggleCategoryBoxForItem(fixture, 0, DETAIL_TAB);

      hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));
      expect(hateQuestions.length).toEqual(HATE_DETAIL_OPTION_COUNT);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'cats', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels() },
        { category: 'dogs', markedAsCategory: true, hatefulLabels: getAllFalseHatefulDetailLabels() },
      ]);

      // Unchecks the box for the second identity.
      toggleCategoryBoxForItem(fixture, 1, DETAIL_TAB);

      hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));
      expect(hateQuestions.length).toEqual(0);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        { category: 'cats', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels() },
        { category: 'dogs', markedAsCategory: false, hatefulLabels: getAllFalseHatefulDetailLabels() },
      ]);
    });
  }))));

  it('Detailed labels: Checking "None of the Above" unchecks other detail options', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const HATE_DETAIL_OPTION_COUNT = 5;

    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.componentInstance.setTestIdentities(["foo"]);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    const jobComponent = fixture.componentInstance.identityJobComponent;

    changeToTab(1, fixture);
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: false,
          hatefulLabels: getAllFalseHatefulDetailLabels()
        },
      ]);

      const questions = fixture.debugElement.queryAll(By.css('.detailedLabels .identityQuestion'));

      // Check the box for the identity.
      toggleCategoryBoxForItem(fixture, 0, DETAIL_TAB);

      expect(questions[0].componentInstance.checked).toBe(true);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: true,
          hatefulLabels: getAllFalseHatefulDetailLabels()
        },
      ]);

      const hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));

      // Checks two of the hate detail options
      hateQuestions[0].nativeElement.querySelector('input').click();
      hateQuestions[1].nativeElement.querySelector('input').click();

      fixture.detectChanges();

      expect(hateQuestions[0].componentInstance.checked).toBe(true);
      expect(hateQuestions[1].componentInstance.checked).toBe(true);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: true,
          hatefulLabels: {
            slurs: true,
            violence: true,
            false_accusations: false,
            other_hate: false
          }
        },
      ]);

      // Checks "None of the above"
      hateQuestions[HATE_DETAIL_OPTION_COUNT - 1].nativeElement.querySelector('input').click();
      fixture.detectChanges();

      // Wait for the changes that happen as a result of the first
      // detectChanges, which calls a function that updates variables bound to
      // the checkbox state.
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(hateQuestions[0].componentInstance.checked).toBe(false);
        expect(hateQuestions[1].componentInstance.checked).toBe(false);
        expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
          {
            category: 'foo',
            markedAsCategory: true,
            hatefulLabels: getAllFalseHatefulDetailLabels()
          },
        ]);
      });
    });
  }))));

  it('Detailed labels: Checking detail options unchecks "None of the Above"', async(
    (inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const HATE_DETAIL_OPTION_COUNT = 5;

    const fixture = TestBed.createComponent(IdentityCategoryHateJobTestComponent);
    fixture.componentInstance.setTestIdentities(["foo"]);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    const jobComponent = fixture.componentInstance.identityJobComponent;
    changeToTab(1, fixture);
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: false,
          hatefulLabels: getAllFalseHatefulDetailLabels()
        },
      ]);

      const questions = fixture.debugElement.queryAll(By.css('.detailedLabels .identityQuestion'));

      // Check the box for the identity.
      toggleCategoryBoxForItem(fixture, 0, DETAIL_TAB);

      expect(questions[0].componentInstance.checked).toBe(true);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: true,
          hatefulLabels: getAllFalseHatefulDetailLabels()
        },
      ]);

      const hateQuestions = fixture.debugElement.queryAll(By.css('.detailedLabels .hateDetailQuestionOption'));

      // Checks "None of the above"
      hateQuestions[HATE_DETAIL_OPTION_COUNT - 1].nativeElement.querySelector('input').click();
      fixture.detectChanges();

      expect(hateQuestions[HATE_DETAIL_OPTION_COUNT - 1].componentInstance.checked).toBe(true);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: true,
          hatefulLabels: getAllFalseHatefulDetailLabels()
        },
      ]);

      // Checks one of the hate detail options
      hateQuestions[0].nativeElement.querySelector('input').click();
      fixture.detectChanges();

      expect(hateQuestions[0].componentInstance.checked).toBe(true);
      expect(hateQuestions[HATE_DETAIL_OPTION_COUNT - 1].componentInstance.checked).toBe(false);
      expect(jobComponent.buildAnswer().identitiesWithLabels).toEqual([
        {
          category: 'foo',
          markedAsCategory: true,
          hatefulLabels: {
            slurs: true,
            violence: false,
            false_accusations: false,
            other_hate: false
          }
        },
      ]);
    });
  }))));
});
