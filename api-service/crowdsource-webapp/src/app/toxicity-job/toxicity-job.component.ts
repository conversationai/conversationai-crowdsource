import { Component, Input } from '@angular/core';
import { BaseJobComponent } from '../base-job/base-job.component';
import { CommentQuestion } from '../crowdsource-api.service';

interface TestJobCrowdSourceAnswer {
  readableAndInEnglish: string;
  toxic: string;
  obscene: string;
  insult: string;
  threat: string;
  identityHate: string;
  comments: string;
}

// Constants for data collection
const YES = 'yes';
const NO = 'no';

@Component({
  selector: 'app-toxicity-job',
  templateUrl: './toxicity-job.component.html',
  styleUrls: ['./toxicity-job.component.css']
})
export class ToxicityJobComponent extends BaseJobComponent<CommentQuestion> {
  readableAndInEnglish: boolean;
  toxicityAnswer: string;
  obsceneAnswer: string;
  insultAnswer: string;
  threatAnswer: string;
  hateAnswer: string;
  comments: string;

  public buildAnswer(): {} {
    return {
        readableAndInEnglish: this.readableAndInEnglish ? YES : NO,
        toxic: this.toxicityAnswer,
        obscene: this.obsceneAnswer,
        insult: this.insultAnswer,
        threat: this.threatAnswer,
        identityHate: this.hateAnswer,
        comments: this.comments
      };
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
