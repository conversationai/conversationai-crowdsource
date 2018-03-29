import {Component, Input } from '@angular/core';
import { CrowdSourceAnswer } from './crowd_source_api.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material';
import { BaseJobComponent } from './base_job.component';

interface IdentityCategoryHateJobCrowdSourceAnswer extends CrowdSourceAnswer {
  identitiesWithLabels: IdentityCategoryAndHateBool[]|IdentityCategoryAndHateLabels[];
}

/** Identity hate answer with a boolean label for hateful. */
interface IdentityCategoryAndHateBool {
  category: string;
  markedAsCategory: boolean;
  hateful: boolean;
}

/** Identity hate answer with a dictionary of hateful labels. */
interface IdentityCategoryAndHateLabels {
  category: string;
  markedAsCategory: boolean;
  hatefulLabels: {[label: string]: boolean};
}

/**
 * Test UI component for an identity hate labeling job which provides two UI
 * options in different tabs. One UI option presents a boolean checkbox for
 * hateful per category, the other presents multiple checkboxes for different
 * aspects of hate.
 */
@Component({
  selector: 'identity-category-hate-job',
  templateUrl: './identity_category_hate_job.component.html',
  styleUrls: ['./identity_category_hate_job.component.css']
})
export class IdentityCategoryHateJobComponent extends BaseJobComponent {
  @Input() routerPath = '/identity_category_hate_job';

  selectedTabIndex = 0;

  @Input() identities: string[] = ['group1', 'group2'];
  detailedHateOptions = [
    {
      text: 'contain slurs, epithets, or profane language directed towards the identity group',
      key: 'slurs'
    },
    {
      text: 'threaten or incite violence towards the identity group',
      key: 'violence',
    },
    {
      text: 'make false accusations (such as conspiracy theories) against the identity group',
      key: 'false_accusations',
    },
    {
      text: 'otherwise insult or demean the identity group',
      key: 'other_hate',
    },
  ];

  booleanLabels : {[key: string]: IdentityCategoryAndHateBool } = {};
  detailLabels : {[key: string]: IdentityCategoryAndHateLabels } = {};

  public buildAnswer(): IdentityCategoryHateJobCrowdSourceAnswer {
    if (this.selectedTabIndex === 0) {
      return Object.assign(
        super.buildAnswer(),
        {
          identitiesWithLabels: Object.keys(this.booleanLabels).map(key=>this.booleanLabels[key]),
        }
      );
    } else {
      return Object.assign(
        super.buildAnswer(),
        {
          identitiesWithLabels: Object.keys(this.detailLabels).map(key=>this.detailLabels[key]),
        }
      );
    }
  }

  resetQuestionUI(): void {
    this.booleanLabels = {};
    this.detailLabels = {};
    if (!this.identities) {
      return;
    }
    for (let identity of this.identities) {
      this.booleanLabels[identity] = {
        category: identity,
        markedAsCategory: false,
        hateful: false,
      };

      this.detailLabels[identity] = {
        category: identity,
        markedAsCategory: false,
        hatefulLabels: {},
      };
      for (let option of this.detailedHateOptions) {
        this.detailLabels[identity].hatefulLabels[option.key] = false;
      }
    }
  }

  clearHateDetailLabelsIfNoneSelected(event: MatCheckboxChange, identity: string) {
    if (event.checked) {
      for (let option of this.detailedHateOptions) {
        this.detailLabels[identity].hatefulLabels[option.key] = false;
      }
    }
  }

  clearNoneLabelIfHateDetailsSelected(event: MatCheckboxChange,
                                      noneCheckbox: MatCheckbox) {
    if (event.checked) {
      noneCheckbox.checked = false;
    }
  }

  clearHatefulLabelsIfCategoryDeselected(identity: string) {
    if (!this.detailLabels[identity].markedAsCategory) {
      for (let option of this.detailedHateOptions) {
        this.detailLabels[identity].hatefulLabels[option.key] = false;
      }
    }
  }
}
