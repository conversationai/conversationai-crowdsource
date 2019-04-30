import {Component, Input, OnInit} from '@angular/core';
import {BaseJobComponent} from '../base-job/base-job.component';
import {
  CommentQuestion,
  WorkToDo
} from '../crowdsource-api.service';

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
const TEST_DATA: WorkToDo<CommentQuestion>[] = [
  {
    'question_id': '1519491252',
    'question': {
      'id': '1519491252',
      'text': 'Wow, your are quite arrogant aren\'t you?'
    },
    'answers_per_question': 3,
    'answer_count': 0
  },
  {
    'question_id': '1520241452',
    'question': {
      'id': '1520241452',
      'text': 'TRIGGERED BEYOND BELIEF. Right wing motherfucking DeathSquads. Now.'
    },
    'answers_per_question': 3,
    'answer_count': 0
  },
  {
    'question_id': '1519828178',
    'question': {
      'id': '1519828178',
      'text': 'nicolaterino fucking sucks and deserves to be bullied'
    },
    'answers_per_question': 3,
    'answer_count': 0
  },
  {
    'question_id': '1519810096',
    'question': {
      'id': '1519810096',
      'text': 'This experiment is absolute nonsense.'
    },
    'answers_per_question': 3,
    'answer_count': 0
  },
  {
    'question_id': '1520207658',
    'question': {
      'id': '1520207658',
      'text': 'That face looks like it was slapped with a frozen trout...\n\nJust sayin.....'
    },
    'answers_per_question': 3,
    'answer_count': 0
  },
  {
    'question_id': '1519988930',
    'question': {
      'id': '1519988930',
      'text': 'Set women on fire'
    },
    'answers_per_question': 3,
    'answer_count': 0
  }
];

@Component({
  selector: 'app-toxicity-job',
  templateUrl: './toxicity-job.component.html',
  styleUrls: ['./toxicity-job.component.css']
})
export class ToxicityJobComponent extends BaseJobComponent<CommentQuestion> implements OnInit {
  @Input() routerPath = '/toxicity_job';

  readableAndInEnglish: boolean;
  toxicityAnswer: string;
  obsceneAnswer: string;
  insultAnswer: string;
  threatAnswer: string;
  hateAnswer: string;
  comments: string;

  ngOnInit() {
    super.ngOnInit();
    this.setTestData(TEST_DATA);
  }

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
