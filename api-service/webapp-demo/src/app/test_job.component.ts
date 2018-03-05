import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
  CommentQuestion,
  CrowdSourceApiService,
  CrowdSourceAnswer,
  JobQualitySummary,
  WorkToDo,
  WorkerQualitySummary
} from './crowd_source_api.service';
// import * as wpconvlib from '@conversationai/wpconvlib';

interface TestJobCrowdSourceAnswer extends CrowdSourceAnswer {
  readableAndInEnglish: string;
  toxic: string,
  obscene: string,
  insult: string;
  threat: string;
  identityHate: string;
  comments: string;
}

// The maximum is exclusive and the minimum is inclusive
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Constants for data collection
const YES = 'Yes';
const NO = 'No';

@Component({
  selector: 'test-job',
  templateUrl: './test_job.component.html',
  styleUrls: ['./test_job.component.css']
})
export class TestJobComponent implements OnInit {
  userNonce: string|null;
  errorMessage: string|null;

  customClientJobKey?: string;
  notEmbedded: boolean = true;

  selectedWork: WorkToDo;
  questionId?: string;
  question: CommentQuestion|null;

  readableAndInEnglish: boolean;
  toxicityAnswer: string;
  obsceneAnswer: string;
  insultAnswer: string;
  threatAnswer: string;
  hateAnswer: string;
  comments: string;

  loading: boolean;

  training_answer_count: number = 0;
  user_mean_score: number = 0;

  overall_job_answer_count: number = 0;
  overall_job_mean_score: number = 0;

  // Saved into local storage and used to measure the number of sent
  // requests from the browser's prespective.
  local_sent_count: number = 0;

  constructor(private router: Router, private route: ActivatedRoute,
              private crowdSourceApiService: CrowdSourceApiService) {}

  chooseRandomWorkToDo(data: WorkToDo[]): void {
    this.selectedWork = data[getRandomInt(0, data.length - 1)];
    console.log('Work to do: ', this.selectedWork);
    this.questionId = this.selectedWork.question_id;
    if (this.customClientJobKey && this.questionId) {
      this.router.navigate([
        '/test_job',
        this.customClientJobKey,
        this.questionId
      ]);
    }
    this.question = this.selectedWork.question;
  }

  getNextWorkItem() {
    this.loading = true;
    this.readableAndInEnglish = true;
    this.toxicityAnswer = '';
    this.obsceneAnswer = '';
    this.insultAnswer = '';
    this.threatAnswer = '';
    this.hateAnswer = '';
    this.comments = '';
    this.question = null;
    this.questionId = '';

    if (this.customClientJobKey && this.questionId) {
      // If url specifies job id and question id, get that specific question.
      this.crowdSourceApiService.getWorkToDoForQuestion(
        this.customClientJobKey, this.questionId)
        .subscribe(
              (workToDo: WorkToDo) => {
                this.chooseRandomWorkToDo([workToDo]);
              },
              (e) => {
                this.errorMessage = e.message;
              });
    } else {
      this.crowdSourceApiService.getWorkToDo(this.customClientJobKey)
          .subscribe(
              (data: WorkToDo[]) => {
                this.chooseRandomWorkToDo(data);
              },
              (e) => {
                this.errorMessage = e.message;
              });
    }

    this.crowdSourceApiService.getJobQuality()
        .subscribe(
            (data: JobQualitySummary) => {
              this.overall_job_answer_count = data.toanswer_count;
              this.overall_job_mean_score = data.toanswer_mean_score;
            },
            (e) => {
              this.errorMessage = e.message;
            });

    if (!this.userNonce) {
      throw new Error('No worker id available');
    }

    this.crowdSourceApiService.getWorkerQuality(this.userNonce)
        .subscribe(
            (data: WorkerQualitySummary) => {
              console.log(data);
              this.training_answer_count = data.answer_count;
              this.user_mean_score = data.mean_score;
            },
            (e) => {
              this.errorMessage = e.message;
            });
  }

  clearError() {
    this.errorMessage = null;
  }

  ngOnInit(): void {
    // Determine if page should render in embedded mode
    var query = document.location.search.substr(1)
    var embedded_query = /embedded=(true|false)/g.exec(query);
    if (embedded_query) {
      this.notEmbedded = !(embedded_query[1] == 'true');
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
    console.log(`user_nonce: ` + this.userNonce);

    this.route.params.subscribe((params: Params) => {
      this.customClientJobKey = params['jobId'];
      this.questionId = params['questionId'];
    });

    this.getNextWorkItem();
  }

  public sendScoreToApi() {
    console.log('test click');

    const answer: TestJobCrowdSourceAnswer = {
      questionId: this.questionId,
      userNonce: this.userNonce,
      readableAndInEnglish: this.readableAndInEnglish ? YES: NO,
      toxic: this.toxicityAnswer,
      obscene: this.obsceneAnswer,
      insult: this.insultAnswer,
      threat: this.threatAnswer,
      identityHate: this.hateAnswer,
      comments: this.comments
    };

    // If we have a parent window, send message to it with the answer. This
    // allows the crowdsourcing interface to be embedded in an iFrame and
    // communicate with the parent window.
    if (window.self != window.top) {
      console.log('sending message with the answer to parent window');
      window.parent.postMessage(JSON.stringify(answer), '*');
    } else {
      console.log('not sending message because no parent window');
    }

    this.crowdSourceApiService.postAnswer(answer, this.customClientJobKey)
        .subscribe(
            (data: {}) => {
              console.log(
                  `sent score; got response:` + JSON.stringify(data, null, 2));
              this.local_sent_count += 1;
              localStorage.setItem(
                  'local_sent_count', this.local_sent_count.toString());
              if (this.customClientJobKey) {
                this.router.navigate([
                  '/test_job',
                  this.customClientJobKey,
                ]);
              }
              this.getNextWorkItem();
            },
            (e) => {
              this.errorMessage = e.message;
            });
  }
}
