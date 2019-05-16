import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ToxicityJobComponent } from './toxicity-job/toxicity-job.component';
import { RelativeToxicityJobComponent } from './relative-toxicity-job/relative-toxicity-job.component';
import { RelativeToxicityAnswersPageComponent } from './relative-toxicity-answers-page/relative-toxicity-answers-page.component';

const routes: Routes = [
  // This path (with no parameters) is needed because paramMap will use the
  // clientJobKey in matrix url notation after the initial load.
  {path: 'toxicity_job', component: ToxicityJobComponent},
  {path: 'toxicity_job/:clientJobKey', component: ToxicityJobComponent},
  {path: '', redirectTo: 'toxicity_job/600-dawid-skene-high-diffs', pathMatch: 'full'},
  {path: 'relative_toxicity_job/:clientJobKey', component: RelativeToxicityJobComponent},
  {
    path: 'relative_toxicity_job',
    redirectTo: 'relative_toxicity_job/wikipedia_relative_rating_pairs_demo1',
    pathMatch: 'full'
  },
  {path: 'relative_toxicity_job/answers/:clientJobKey', component: RelativeToxicityAnswersPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
