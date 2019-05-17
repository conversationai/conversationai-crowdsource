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
import { Observable } from 'rxjs';

// Because these structures come from the DB, they currently have underscore
// word separaters instead of useing CamelCase.
// TODO: make the DB, and field names, and any uses in the server, also be
// CamelCase so that we can use a more consistent code style.
export interface WorkToDo<T> {
  question_id: string;
  question: T;
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

export interface AnswerSummary<T> {
  question_id: string;
  answer_id: string;
  timestamp: string;
  worker_nonce: string;
  answer: T;
}

@Injectable()
export class CrowdsourceApiService {

  constructor(private http: HttpClient) {}

  getWorkToDoForQuestion<T>(clientJobKey: string, questionId: string):
    Observable<WorkToDo<T>> {
    return this.http.get<WorkToDo<T>>(`/client_jobs/${clientJobKey}/questions/${questionId}`);
  }

  getWorkToDo<T>(clientJobKey: string, userNonce: string): Observable<WorkToDo<T>[]> {
      // If specified job, get next questions for that job.
      return this.http.get<WorkToDo<T>[]>(`/client_jobs/${clientJobKey}/${userNonce}/next10_unanswered_questions`);
  }

  getJobQuality(clientJobKey: string): Observable<JobQualitySummary> {
    return this.http.get<JobQualitySummary>(`/client_jobs/${clientJobKey}/quality_summary`);
  }

  getWorkerQuality(clientJobKey: string, userNonce: string): Observable<WorkerQualitySummary> {
    return this.http.get<WorkerQualitySummary>(`/client_jobs/${clientJobKey}/workers/${userNonce}/quality_summary`);
  }

  postAnswer(clientJobKey: string, questionId: string, userNonce: string|undefined, answer: {}):
      Observable<{}> {
    if (!userNonce) {
      userNonce = '';
    }
    const answerPath = `/client_jobs/${clientJobKey}/questions/${questionId}/answers/${userNonce}`;
    console.log(`answer: ${answer}`);
    return this.http.post(answerPath, answer);
  }

  getAnswers<T>(clientJobKey: string): Observable<AnswerSummary<T>[]> {
    return this.http.get<AnswerSummary<T>[]>(`client_jobs/${clientJobKey}/answers`);
  }
}
