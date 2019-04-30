import {Component, Input, OnInit} from '@angular/core';
import {BaseJobComponent} from '../base-job/base-job.component';
import {
  CommentQuestion,
  WorkToDo
} from '../crowdsource-api.service';

interface TestJobCrowdSourceAnswer {
  commentA: string;
  commentB: string;
  toxicityOption: ToxicityOption;
}

enum ToxicityOption {
  MUCH_MORE_TOXIC = 'much more toxic',
  MORE_TOXIC = 'more toxic',
  SLIGHTLY_MORE_TOXIC = 'slightly more toxic',
  ABOUT_THE_SAME = 'about the same',
  SLIGHTLY_LESS_TOXIC = 'slightly less toxic',
  LESS_TOXIC = 'less toxic',
  MUCH_LESS_TOXIC = 'much less toxic'
}

interface RelativeRatingQuestion {
  id_a: string;
  id_b: string;
  comment_a: string;
  comment_b: string;
}

const TEST_DATA: WorkToDo<RelativeRatingQuestion>[] = [
  {
    'question_id': '1519491252',
    'question': {
      'id_a': '02468',
      'id_b': '13579',
      'comment_a': 'Foo bar',
      'comment_b': 'Hello world'
    },
    'answers_per_question': 3,
    'answer_count': 0
  },
  {
    'question_id': '1520215258',
    'question': {
      'id_a': '54321',
      'id_b': '12345',
      'comment_a': 'How are you?',
      'comment_b': 'Testing 123'
    },
    'answers_per_question': 3,
    'answer_count': 0
  },
];

@Component({
  selector: 'app-relative-rating-job',
  templateUrl: './relative-rating-job.component.html',
  styleUrls: ['./relative-rating-job.component.css']
})
export class RelativeRatingJobComponent extends BaseJobComponent<RelativeRatingQuestion> implements OnInit {
  @Input() routerPath = '/relative_rating_job';

  toxicityOption: ToxicityOption;
  toxicityOptions: ToxicityOption[] =
    Object.keys(ToxicityOption).map(key => ToxicityOption[key]);

  relativeRatingQuestion: RelativeRatingQuestion;
  commentA: string;
  commentB: string;

  ngOnInit() {
    super.ngOnInit();
    this.setTestData(TEST_DATA);
    this.getNextWorkItem();
  }

  public buildAnswer(): {} {
    return {
        commentA: this.commentA,
        commentB: this.commentB,
        toxicityOption: this.toxicityOption
      };
  }

  protected updateQuestion(): void {
    super.updateQuestion();
    this.commentA = this.question.comment_a;
    this.commentB = this.question.comment_b;
  }

  resetQuestionUI(): void {
    this.commentA = '';
    this.commentB = '';
    this.toxicityOption = ToxicityOption.ABOUT_THE_SAME;
  }
}
