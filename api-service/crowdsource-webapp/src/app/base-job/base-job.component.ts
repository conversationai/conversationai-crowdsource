import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params, ParamMap, Router } from '@angular/router';
import {
  CrowdsourceApiService,
  JobQualitySummary,
  WorkToDo,
  WorkerQualitySummary
} from '../crowdsource-api.service';

// The maximum is exclusive and the minimum is inclusive
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Constants for data collection
const YES = 'Yes';
const NO = 'No';

interface JobAndQuestionUrlParams {
  clientJobKey: string;
  questionId?: string;
}

/**
 * Base component to inherit from for building custom job components.
 *
 * Each component that inherits from this should override or set the properties
 *   - clientJobKey
 *   - routerPath
 *
 * and additionally add routes to appRoutes corresponding to routerPath in
 * app.module.ts.
 *
 * Child components should also override the functions:
 *   - resetQuestionUI()
 *   - buildAnswer() [When overriding this function, you should call
 *                    super.buildAnswer()]
 *
 * TODO: this doesn't seem to be a real component; it has fake template and
 * router config. Consider if this can be something else, e.g. just a class?
 */
@Component({
  selector: 'app-base-job',
  templateUrl: './base-job.component.html',
})
export class BaseJobComponent<T> implements OnInit {
  @Input() clientJobKey: string;
  @Input() routerPath = '/base_job';

  userNonce: string | null;
  errorMessages: string[] = [];

  notEmbedded = true;

  selectedWork: WorkToDo<T>;
  questionId: string | null = null;
  question: T | null;

  loading: boolean;

  training_answer_count = 0;
  user_mean_score = 0;

  overall_job_answer_count = 0;
  overall_job_mean_score = 0;

  // Saved into local storage and used to measure the number of sent
  // requests from the browser's prespective.
  local_sent_count = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private crowdSourceApiService: CrowdsourceApiService) { }

  ngOnInit(): void {
    // Determine if page should render in embedded mode
    const query = document.location.search.substr(1);
    const embedded_query = /embedded=(true|false)/g.exec(query);
    if (embedded_query) {
      this.notEmbedded = !(embedded_query[1] === 'true');
    }

    this.userNonce = localStorage.getItem('user_nonce');
    const maybe_local_sent_count = localStorage.getItem('local_sent_count');
    if (maybe_local_sent_count !== null) {
      this.local_sent_count = parseInt(maybe_local_sent_count, 10);
    } else {
      this.local_sent_count = 0;
      localStorage.setItem(
        'local_sent_count', this.local_sent_count.toString());
    }

    if (!this.userNonce) {
      this.userNonce = Math.random().toString();
      localStorage.setItem('user_nonce', this.userNonce);
    }

    // TODO(rachelrosen): Refactor this code to use a more asynchronous pattern,
    // 'rxjs/add/operator/switchMap';
    // e.g. nextWork$ = this.route.paramMap.switchMap((params: ParamMap) =>{...});
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.updateIds(params);
    });

    this.getNextWorkItem();
  }

  // Override this in subclasses to clear the answer UI form.
  public resetQuestionUI(): void {}

  // Override this in subclasses to send the job-specific answer.
  public buildAnswer(): {} {
    return { foo: 'bar' };
  }

  updateIds(params: ParamMap): void {
    const clientJobKey = params.get('clientJobKey');
    if (clientJobKey === null) {
      throw new Error('clientJobKey must be specified.');
    }
    this.clientJobKey = clientJobKey;
    this.questionId = params.get('questionId');
  }

  updateUrl(): void {
    if (!this.clientJobKey) {
      return;
    }
    const urlParams: JobAndQuestionUrlParams = {
      clientJobKey: this.clientJobKey,
    };

    if (this.questionId) {
      urlParams.questionId = this.questionId;
    }

    this.router.navigate([this.routerPath, urlParams]);
  }

  public sendScoreToApi() {
    const answer = this.buildAnswer();
    // If we have a parent window, send message to it with the answer. This
    // allows the crowdsourcing interface to be embedded in an iFrame and
    // communicate with the parent window.
    if (window.self !== window.top) {
      console.log('sending message with the answer to parent window');
      window.parent.postMessage(JSON.stringify(answer), '*');
    } else {
      console.log('not sending message because no parent window.');
    }

    this.crowdSourceApiService.postAnswer(
        this.clientJobKey, this.questionId, this.userNonce, answer)
      .subscribe(
        (data: {}) => {
          this.local_sent_count += 1;
          localStorage.setItem(
            'local_sent_count', this.local_sent_count.toString());
          this.questionId = '';
          this.getNextWorkItem();
        },
        (e: Error) => {
          console.error(e);
          this.errorMessages.push(e.message);
        });
  }

  chooseRandomWorkToDo(data: WorkToDo<T>[]): void {
    if (data.length === 0) {
      console.error('Data length is 0 in chooseRandomWorkToDo()');
      return;
    }
    console.log(data);
    const randomItemIndex = getRandomInt(0, data.length - 1);

    this.selectedWork = data[randomItemIndex];
    this.questionId = this.selectedWork.question_id;

    if (!this.clientJobKey) {
      throw new Error('Trying to pick work, but no job key found');
    }

    this.updateUrl();
    this.updateQuestion();
  }

  protected updateQuestion(): void {
    this.question = this.selectedWork.question;
  }

  getNextWorkItem() {
    console.log('getNextWorkItem()');
    this.resetQuestionUI();
    this.loading = true;
    this.question = null;

    if (this.clientJobKey && this.questionId) {
      // If url specifies job id and question id, get that specific question.
      this.crowdSourceApiService.getWorkToDoForQuestion<T>(
        this.clientJobKey, this.questionId)
        .subscribe(
          (workToDo: WorkToDo<T>) => {
            this.chooseRandomWorkToDo([workToDo]);
          },
          (e) => {
            console.error(e);
            this.errorMessages.push(e.message);
          });
    } else {
      this.crowdSourceApiService.getWorkToDo<T>(this.clientJobKey)
        .subscribe(
          (workItemsToDo: WorkToDo<T>[]) => {
            this.chooseRandomWorkToDo(workItemsToDo);
          },
          (e) => {
            console.error(e);
            this.errorMessages.push(e.message);
          });
    }

    this.crowdSourceApiService.getJobQuality(this.clientJobKey)
      .subscribe(
        (data: JobQualitySummary) => {
          this.overall_job_answer_count = data.toanswer_count;
          this.overall_job_mean_score = data.toanswer_mean_score;
        },
        (e) => {
          console.error(e);
          this.errorMessages.push(e.message);
        });

    if (!this.userNonce) {
      throw new Error('No worker id available');
    }

    this.crowdSourceApiService.getWorkerQuality(this.clientJobKey, this.userNonce)
      .subscribe(
        (data: WorkerQualitySummary) => {
          this.training_answer_count = data.answer_count;
          this.user_mean_score = data.mean_score;
        },
        (e) => {
          console.error(e);
          this.errorMessages.push(e.message);
        });
  }

  clearError() {
    this.errorMessages = [];
  }

  // Debugging method that clears the current questionId from the url and
  // fetches a new question if there is an error.
  clearQuestionAndGetNext() {
    this.questionId = null;
    this.clearError();
    this.getNextWorkItem();
  }

}
