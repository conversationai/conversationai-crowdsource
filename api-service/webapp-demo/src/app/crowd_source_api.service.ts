/*
Copyright 2017 Google Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

// Because these structures come from the DB, they currently have underscore
// word separaters instead of useing CamelCase.
// TODO: make the DB, and field names, and any uses in the server, also be
// CamelCase so that we can use a more consistent code style.
export interface WorkToDo {
  question_id: string;
  question: CommentQuestion;
  answers_per_question: number;
  answer_count: number;
}

export interface CommentQuestion {
  id: string;
  text: string;
}

export interface WorkerQualitySummary {
  answer_count: number;
  mean_score: number;
}

export interface JobQualitySummary {
  toanswer_count: number;
  toanswer_mean_score: number;
}

export interface CrowdSourceAnswer {
  questionId: string;
  userNonce: string;
}

@Injectable()
export class CrowdSourceApiService {

  constructor(private http: HttpClient) {}

  getWorkToDoForQuestion(customClientJobKey: string, questionId: string):
    Observable<WorkToDo> {
    return this.http.get('/api/work/' + customClientJobKey + '/' + questionId);
  }

  getWorkToDo(customClientJobKey?: string): Observable<WorkToDo[]> {
    if (customClientJobKey) {
      // If specified job, get next questions for that job.
      return this.http.get('/api/work/' + customClientJobKey);
    } else {
      // Otherwise get questions for this job.
      return this.http.get('/api/work');
    }
  }

  getJobQuality(): Observable<JobQualitySummary> {
    // CONSIDER: support custom job keys.
    return this.http.get('/api/job_quality');
  }

  getWorkerQuality(userNonce: string) : Observable<WorkerQualitySummary>{
    return this.http.get('/api/quality/' + userNonce);
  }

  postAnswer(crowdSourceAnswer: CrowdSourceAnswer, customClientJobKey?: string):
      Observable<{}> {
    let answerPath = '/api/answer';
    if (customClientJobKey) {
      answerPath += '/' + customClientJobKey;
    }
    return this.http.post(answerPath, crowdSourceAnswer);
  }
}
