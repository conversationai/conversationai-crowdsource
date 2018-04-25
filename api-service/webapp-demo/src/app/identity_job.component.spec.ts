import { Component, Injectable, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
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
import { IdentityJobComponent } from './identity_job.component';
import { CrowdSourceApiService } from './crowd_source_api.service';

// Test component wrapper for BaseJobComponent.
@Component({
  selector: 'base-job-test',
  template: `<identity-job [identities]="testIdentities"></identity-job>`
})
class IdentityJobTestComponent {
  @ViewChild(IdentityJobComponent)
  identityJobComponent: IdentityJobComponent;

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
                            customClientJobKey: string,
                            fixture: ComponentFixture<IdentityJobTestComponent>) {
  // Verify the call to load a question.
  httpMock.expectOne('/api/work/' + customClientJobKey).flush([{
    question_id: 'foo',
    question: {id: 'bar', text: 'Hello world!'},
    answers_per_question: 10,
    answer_count: 5
  }]);
  fixture.detectChanges();
}

function checkIdentity(fixture: ComponentFixture<IdentityJobTestComponent>,
                       index: number) {
  const questions = fixture.debugElement.queryAll(By.css('.identityQuestion'));
  questions[index].nativeElement.querySelector('input').click();
  fixture.detectChanges();
}

let activatedRoute: ActivatedRouteStub;

describe('IdentityJobComponent tests', () => {
  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParams = {};
    TestBed.configureTestingModule({
      imports: [
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
                path: 'identity_job',
                component: IdentityJobComponent
              },
              {
                path: 'identity_job/:customClientJobKey',
                component: IdentityJobComponent
              },
          ]
        )
      ],
      declarations: [
        IdentityJobTestComponent,
        IdentityJobComponent,
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        CrowdSourceApiService,
      ]
    }).compileComponents();
  }));

  it('Builds answer with checked identities', async((inject([HttpTestingController], (httpMock: HttpTestingController) => {
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };

    const fixture = TestBed.createComponent(IdentityJobTestComponent);
    fixture.componentInstance.setTestIdentities(['a', 'b', 'c', 'd']);
    fixture.detectChanges();
    setupQuestionMocks(httpMock, 'testJobKey', fixture);

    // check 'b' and 'd'
    checkIdentity(fixture, 1);
    checkIdentity(fixture, 3);

    const jobComponent = fixture.componentInstance.identityJobComponent;
    expect(jobComponent.buildAnswer().selectedIdentities).toEqual(['b', 'd']);
  }))));
});
