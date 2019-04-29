import { Injectable } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpTestingController } from '@angular/common/http/testing';
import { ParamMapStub } from './param_map_stub';

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

export function setupQuestionMocks(httpMock: HttpTestingController,
                                   clientJobKey: string,
                                   fixture: ComponentFixture<any>) {
  // Verify the call to load a question.
  httpMock.expectOne('/api/work/' + clientJobKey).flush([{
    question_id: 'foo',
    question: {id: 'bar', text: 'Hello world!'},
    answers_per_question: 10,
    answer_count: 5
  }]);
  fixture.detectChanges();
}
