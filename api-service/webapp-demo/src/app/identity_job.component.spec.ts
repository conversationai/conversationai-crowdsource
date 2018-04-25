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
import { IdentityJobComponent } from './identity_job.component';
import { CrowdSourceApiService } from './crowd_source_api.service';
import { ActivatedRouteStub, setupQuestionMocks } from './test_util';

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
        MatCheckboxModule,
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
