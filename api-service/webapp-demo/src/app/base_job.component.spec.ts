import { Component, Injectable } from '@angular/core';
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
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseJobComponent } from './base_job.component';
import { CrowdSourceApiService } from './crowd_source_api.service';

@Component({
  selector: 'base-job-test',
  template: "<base-job></base-job>"
})
class BaseJobTestComponent {
}

@Component({
  selector: 'base-job-extended-test',
  template: "<my-job></my-job>"
})
class BaseJobExtendedTestComponent {
}

@Component({
  selector: 'my-job',
  template: `<div *ngIf="question !== null">{{question.text}}</div>`
})
class MyJobComponent extends BaseJobComponent {
  customClientJobKey = 'testJobKey';
  routerPath = '/my_job';
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
                path: 'my_job/:customClientJobKey',
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
    activatedRoute.testParams = {
      customClientJobKey: 'testJobKey'
    };
    const fixture = TestBed.createComponent(BaseJobExtendedTestComponent);
    fixture.detectChanges();

    httpMock.expectOne((req: HttpRequest<any>): boolean => {
      const workRequestUrlRegExp = /\/api\/work\/?(\w+)?/;
      const match = workRequestUrlRegExp.exec(req.urlWithParams);
      if (match !== null) {
        expect(match[1]).toEqual('testJobKey');
      }
      return match !== null;
    }).flush([{
      question_id: 'foo',
      question: {id: 'bar', text: 'Hello world!'},
      answers_per_question: 10,
      answer_count: 5
    }]);

    httpMock.expectOne('/api/job_quality').flush({
      toanswer_count: 50,
      toanswer_mean_score: 2
    });

    httpMock.expectOne((req: HttpRequest<any>): boolean => {
      const workerQualityRequestUrlRegExp = /\/api\/quality\/?(\w+)?/;
      const match = workerQualityRequestUrlRegExp.exec(req.urlWithParams);
      return match !== null;
    }).flush({
      answer_count: 20,
      mean_score: 1.5
    });

    httpMock.verify();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Hello world!');
    });
  }))));
});
