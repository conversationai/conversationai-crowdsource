import { Component, Input } from '@angular/core';
import { BaseJobComponent } from '../base-job/base-job.component';
import { CommentQuestion } from '../crowdsource-api.service';

interface TestJobCrowdSourceAnswer {
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

@Component({
  selector: 'app-relative-rating-job',
  templateUrl: './relative-rating-job.component.html',
  styleUrls: ['./relative-rating-job.component.css']
})
export class RelativeRatingJobComponent extends BaseJobComponent<RelativeRatingQuestion> {
  @Input() routerPath = '/relative_rating_job';
  toxicityOption: ToxicityOption;
  toxicityOptions: ToxicityOption[] =
    Object.keys(ToxicityOption).map(key => ToxicityOption[key]);

  public buildAnswer(): {} {
    return { toxicityOption: this.toxicityOption };
  }

  protected updateQuestion(): void {
    super.updateQuestion();
    // TODO: The data is incorrectly stored in the db as a JSON string instead
    // of JSON, like it is for the other jobs. We should fix this and then
    // remove the JSON.parse() here.
    this.question = JSON.parse(this.question as any as string);
  }

  resetQuestionUI(): void {
    this.toxicityOption = ToxicityOption.ABOUT_THE_SAME;
  }
}
