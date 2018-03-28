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

interface IdentityCategoryHateJobCrowdSourceAnswer extends CrowdSourceAnswer {
  identitiesWithLabels: IdentityCategoryAndHateLabels[];
}

interface IdentityCategoryAndHateLabels {
  category: string;
  markedAsCategory: boolean;
  hateful: boolean;
}

// Constants for data collection
const YES = 'Yes';
const NO = 'No';

@Component({
  selector: 'identity-category-hate-job',
  templateUrl: './identity_category_hate_job.component.html',
  styleUrls: ['./identity_category_hate_job.component.css']
})
export class IdentityCategoryHateJobComponent extends BaseJobComponent {
  @Input() routerPath = '/identity_category_hate_job';

  identities: string[] = ['group1', 'group2'];
  labels : {[key: string]: IdentityCategoryAndHateLabels } = {};

  public buildAnswer(): IdentityCategoryHateJobCrowdSourceAnswer {
    return Object.assign(
      super.buildAnswer(),
      {
        identitiesWithLabels: Object.keys(this.labels).map(key=>this.labels[key]),
      }
    );
  }

  resetQuestionUI(): void {
    this.labels = {};
    for (let identity of this.identities) {
      this.labels[identity] = {
        category: identity,
        markedAsCategory: false,
        hateful: false
      };
    }
  }
}
