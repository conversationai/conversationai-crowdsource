import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, ParamMap, Router } from '@angular/router';
import {
  AnswerSummary,
  CrowdsourceApiService,
} from '../crowdsource-api.service';
import { RelativeToxicityAnswer } from '../relative-toxicity-job/relative-toxicity-job.component';

interface QuestionsToAnswersMap {
  [questionId: string]: AnswerSummary<RelativeToxicityAnswer>[];
}

/**
 */
@Component({
  selector: 'app-relative-toxicity-answers-page',
  templateUrl: './relative-toxicity-answers-page.component.html',
  styleUrls: ['./relative-toxicity-answers-page.component.css'],
})
export class RelativeToxicityAnswersPageComponent implements OnInit {
  clientJobKey: string;

  answers: AnswerSummary<RelativeToxicityAnswer>[] = [];
  questionsToAnswersMap: QuestionsToAnswersMap = {};
  questionIds: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private crowdSourceApiService: CrowdsourceApiService) { }

  ngOnInit(): void {
    console.log('Init inside answers page component');
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.updateIds(params);
      this.getAnswers();
    });
  }

  updateIds(params: ParamMap): void {
    const clientJobKey = params.get('clientJobKey');
    if (clientJobKey === null) {
      throw new Error('clientJobKey must be specified.');
    }
    this.clientJobKey = clientJobKey;
  }

  getAnswers() {
    if (!this.clientJobKey) {
      throw new Error('Can\'t fetch answers without a client job key');
    }
    this.crowdSourceApiService.getAnswers(this.clientJobKey)
        .subscribe(
          (data: AnswerSummary<RelativeToxicityAnswer>[]) => {
            console.log(data);
            this.answers = data;
            this.questionsToAnswersMap = {};
            this.questionIds = [];
            this.answers.forEach((answer, index) => {
              if (!this.questionsToAnswersMap[answer.question_id]) {
                this.questionsToAnswersMap[answer.question_id] = [];
                this.questionIds.push(answer.question_id);
              }
              this.questionsToAnswersMap[answer.question_id].push(answer);
            });
            console.log(this.questionIds);
            console.log(this.questionsToAnswersMap);
          },
          (e) => {
            console.error(e);
          });
  }

}
