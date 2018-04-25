import {Component, Input } from '@angular/core';
import { CrowdSourceAnswer } from './crowd_source_api.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material';
import { BaseJobComponent } from './base_job.component';

interface IdentityJobCrowdSourceAnswer extends CrowdSourceAnswer {
  selectedIdentities: string[];
}

interface IdentityBool {
  category: string;
  markedAsCategory: boolean;
}

@Component({
  selector: 'identity-job',
  templateUrl: './identity_job.component.html',
  styleUrls: ['./identity_job.component.css'],
  host: { '(window:keydown)': 'handleKeyDown($event)' },
})
export class IdentityJobComponent extends BaseJobComponent {
  @Input() routerPath = '/identity_job';

  @Input() identities: string[] = [
    'asian',
    'atheist',
    'black',
    'christian',
    'female',
    'homosexual_gay_or_lesbian',
    'intellectual_or_mental_disability',
    'jewish',
    'male',
    'mental_illness_or_mood_disorder',
    'muslim',
    'nationality_or_country_related_identity',
    'other_health_age_or_disability_related_identity',
    'other_religion',
    'transgender',
    'white'
  ];

  booleanLabels : {[key: string]: IdentityBool } = {};

  public buildAnswer(): IdentityJobCrowdSourceAnswer {
    const selectedIdentities = [];
    for (let identity in this.booleanLabels) {
      if (this.booleanLabels[identity].markedAsCategory) {
        selectedIdentities.push(identity);
      }
    }
    return Object.assign(
      super.buildAnswer(), {selectedIdentities}
    );
  }

  resetQuestionUI(): void {
    this.booleanLabels = {};
    for (let identity of this.identities) {
      this.booleanLabels[identity] = {
        category: identity,
        markedAsCategory: false
      };
    }
  }

  handleKeyDown($event: KeyboardEvent) {
    if ($event.key === 's') {
      this.sendScoreToApi();
    }
  }
}
