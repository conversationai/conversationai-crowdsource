import { Component, Input } from '@angular/core';
import { BaseJobComponent } from '../base-job/base-job.component';
import { CommentQuestion } from '../crowdsource-api.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

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

interface ScaleItem {
  text: string;
  disabled: boolean;
  label?: string;
  selected?: boolean;
  scaleInfo?: string;
}

@Component({
  selector: 'app-relative-rating-job',
  templateUrl: './relative-rating-job.component.html',
  styleUrls: ['./relative-rating-job.component.css']
})
export class RelativeRatingJobComponent extends BaseJobComponent<RelativeRatingQuestion> {
  @Input() routerPath = '/relative_rating_job';
  @Input() useRadioButtons = false;
  toxicityOption: ToxicityOption;
  toxicityOptions: ToxicityOption[] =
    Object.keys(ToxicityOption).map(key => ToxicityOption[key]);

  sample: ScaleItem[] = [];
  toxicityScale: ScaleItem[] = [];

  commentAIndex = 0;
  commentBIndex = 0;

  public buildAnswer(): {} {
    if (this.useRadioButtons) {
      return { toxicityOption: this.toxicityOption };
    } else {
      return { toxicityOption: this.getToxicityOption() };
    }
  }

  protected updateQuestion(): void {
    super.updateQuestion();
    // TODO: The data is incorrectly stored in the db as a JSON string instead
    // of JSON, like it is for the other jobs. We should fix this and then
    // remove the JSON.parse() here.
    this.question = JSON.parse(this.question as any as string);
    this.sample = [
      {scaleInfo: ToxicityOption.MUCH_LESS_TOXIC, disabled: true},
      {scaleInfo: ToxicityOption.LESS_TOXIC, disabled: true},
      {scaleInfo: ToxicityOption.SLIGHTLY_LESS_TOXIC, disabled: true},
      {
        scaleInfo: ToxicityOption.ABOUT_THE_SAME,
        disabled: true,
        selected: true
      },
      {scaleInfo: ToxicityOption.SLIGHTLY_MORE_TOXIC, disabled: true},
      {scaleInfo: ToxicityOption.MORE_TOXIC, disabled: true},
      {scaleInfo: ToxicityOption.MUCH_MORE_TOXIC, disabled: true},
    ];
    this.toxicityScale = [
      {text: '', disabled: true},
      {text: '', disabled: true},
      {text: '', disabled: true},
      {text: this.question.comment_a, disabled: false, label: 'commentA'},
      {text: '', disabled: true},
      {text: '', disabled: true},
      {text: '', disabled: true},
    ];
    this.commentAIndex = Math.floor(this.toxicityScale.length / 2);
    this.commentBIndex = Math.floor(this.toxicityScale.length / 2);
  }

  resetQuestionUI(): void {
    this.toxicityOption = ToxicityOption.ABOUT_THE_SAME;
  }

  getToxicityOption(): ToxicityOption {
    if (this.useRadioButtons) {
      return this.toxicityOption;
    }
    const diff = this.commentAIndex - this.commentBIndex;
    switch (diff) {
      case 3:
        return ToxicityOption.MUCH_MORE_TOXIC;
        break;
      case 2:
        return ToxicityOption.MORE_TOXIC;
        break;
      case 1:
        return ToxicityOption.SLIGHTLY_MORE_TOXIC;
        break;
      case 0:
        return ToxicityOption.ABOUT_THE_SAME;
        break;
      case -1:
        return ToxicityOption.SLIGHTLY_LESS_TOXIC;
        break;
      case -2:
        return ToxicityOption.LESS_TOXIC;
        break;
      case -3:
        return ToxicityOption.MUCH_LESS_TOXIC;
        break;
      default:
        throw new Error('No applicable toxicity option for diff ' + diff);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.toxicityScale, event.previousIndex, event.currentIndex);
    for (let i = 0; i < this.toxicityScale.length; i++) {
      this.sample[this.commentAIndex].selected = false;
      if (this.toxicityScale[i].label === 'commentA') {
        this.commentAIndex = i;
      }
    }
    this.sample[this.commentAIndex].selected = true;
  }

  getClassName(toxicityOption: ToxicityOption): string {
    return toxicityOption.replace(/ /g, '_');
  }

}
