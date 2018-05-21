import { Component, Input } from '@angular/core';
import { CrowdSourceAnswer } from './crowd_source_api.service';
import { BaseJobComponent } from './base_job.component';

interface TestQuestionAnswer extends CrowdSourceAnswer {
  testQuestionEval: string;
}

@Component({
  selector: 'test-question-filter',
  templateUrl: './test_question_filter.component.html',
  styleUrls: ['./test_question_filter.component.css'],
})
export class TestQuestionFilterComponent extends BaseJobComponent {
  @Input() routerPath = '/test_question_filter';
  private testQuestionEval = '';

  public setUserSelection(testQuestionEval: string) {
    this.testQuestionEval = testQuestionEval;
    this.sendScoreToApi();
  }

  public buildAnswer(): TestQuestionAnswer {
    return Object.assign(
      super.buildAnswer(), {testQuestionEval: this.testQuestionEval}
    );
  }
}
