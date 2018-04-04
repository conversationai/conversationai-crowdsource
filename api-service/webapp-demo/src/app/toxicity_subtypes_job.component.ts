import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Params, ParamMap, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import {
  CommentQuestion,
  CrowdSourceApiService,
  CrowdSourceAnswer,
  JobQualitySummary,
  WorkToDo,
  WorkerQualitySummary
} from './crowd_source_api.service';
import {BaseJobComponent} from './base_job.component';

interface TestJobCrowdSourceAnswer extends CrowdSourceAnswer {
  readableAndInEnglish: string;
  toxic: string,
  obscene: string,
  insult: string;
  threat: string;
  identityHate: string;
  comments: string;
}

// Constants for data collection
const YES = 'Yes';
const NO = 'No';

@Component({
  selector: 'toxicity-subtype-job',
  templateUrl: './toxicity_subtypes_job.component.html',
  styleUrls: ['./toxicity_subtypes_job.component.css']
})
export class ToxicitySubtypesJobComponent extends BaseJobComponent {
  @Input() routerPath = '/toxicity_subtypes';

  readableAndInEnglish: boolean;
  toxicityAnswer: string;
  obsceneAnswer: string;
  insultAnswer: string;
  threatAnswer: string;
  hateAnswer: string;
  comments: string;

  public buildAnswer(): TestJobCrowdSourceAnswer {
    return Object.assign(
      super.buildAnswer(),
      {
        questionId: this.questionId,
        userNonce: this.userNonce,
        readableAndInEnglish: this.readableAndInEnglish ? YES: NO,
        toxic: this.toxicityAnswer,
        obscene: this.obsceneAnswer,
        insult: this.insultAnswer,
        threat: this.threatAnswer,
        identityHate: this.hateAnswer,
        comments: this.comments
      });
  }

  resetQuestionUI(): void {
    this.readableAndInEnglish = true;
    this.toxicityAnswer = '';
    this.obsceneAnswer = '';
    this.insultAnswer = '';
    this.threatAnswer = '';
    this.hateAnswer = '';
    this.comments = '';
  }
}
