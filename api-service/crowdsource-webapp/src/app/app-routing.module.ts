import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ToxicityJobComponent } from './toxicity-job/toxicity-job.component';

const routes: Routes = [
  // This path (with no parameters) is needed because paramMap will use the
  // clientJobKey in matrix url notation after the initial load.
  {path: 'toxicity_job', component: ToxicityJobComponent},
  {path: 'toxicity_job/:clientJobKey', component: ToxicityJobComponent},
  {path: '', redirectTo: 'toxicity_job/600-dawid-skene-high-diffs', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
