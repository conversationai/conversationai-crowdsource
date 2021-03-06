import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, ParamMap, Router } from '@angular/router';
import { AnswerSummary, CrowdsourceApiService } from '../crowdsource-api.service';
import { RelativeToxicityAnswer } from '../relative-toxicity-job/relative-toxicity-job.component';

interface QuestionsToAnswersMap {
  [questionId: string]: AnswerSummary<RelativeToxicityAnswer>[];
}

/**
 * Component that displays tea answers for examples in a relative rating task.
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
  // Set of questionIds corresponding to the keys in questionsToAnswersMap.
  questionIds: string[] = [];
  debugMode = false;

  constructor(
    private route: ActivatedRoute,
    private crowdSourceApiService: CrowdsourceApiService) { }

  ngOnInit(): void {
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
            // Creates a mapping of question id to a list of answers for that
            // question id.
            this.answers.forEach((answer, index) => {
              if (!this.questionsToAnswersMap[answer.question_id]) {
                this.questionsToAnswersMap[answer.question_id] = [];
              }
              this.questionsToAnswersMap[answer.question_id].push(answer);
            });
            this.questionIds = Object.keys(this.questionsToAnswersMap);
          },
          (e) => {
            console.error(e);
          });
  }
}
