import { Injectable } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpTestingController } from '@angular/common/http/testing';

// Stub for ActivatedRoute.
@Injectable()
export class ActivatedRouteStub {
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

export function setupQuestionMocks(httpMock: HttpTestingController,
                                   customClientJobKey: string,
                                   fixture: ComponentFixture<any>) {
  // Verify the call to load a question.
  httpMock.expectOne('/api/work/' + customClientJobKey).flush([{
    question_id: 'foo',
    question: {id: 'bar', text: 'Hello world!'},
    answers_per_question: 10,
    answer_count: 5
  }]);
  fixture.detectChanges();
}
