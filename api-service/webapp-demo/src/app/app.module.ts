import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { BaseJobComponent } from './base_job.component';
import { IdentityJobComponent } from './identity_job.component';
import { IdentityCategoryHateJobComponent } from './identity_category_hate_job.component';
import { TestJobComponent } from './test_job.component';
import { CrowdSourceApiService} from './crowd_source_api.service';

const appRoutes: Routes = [
  // This path (with no parameters) is needed because paramMap will use the
  // customClientJobKey in matrix url notation after the initial load.
  {
    path: 'test_job',
    component: TestJobComponent
  },
  {
    path: 'test_job/:customClientJobKey',
    component: TestJobComponent
  },
  {
    path: 'identity_category_hate_job',
    component: IdentityCategoryHateJobComponent
  },
  {
    path: 'identity_category_hate_job/:customClientJobKey',
    component: IdentityCategoryHateJobComponent
  },
  {
    path: 'identity_job',
    component: IdentityJobComponent
  },
  {
    path: 'identity_job/:customClientJobKey',
    component: IdentityJobComponent
  },
  {
    path: 'test_question_filter',
    component: TestQuestionFilterComponent
  },
  {
    path: 'test_question_filter/:customClientJobKey',
    component: TestQuestionFilterComponent
  },
  {
    path: '',
    redirectTo: '/test_job',
    pathMatch: 'full'
  },
];


@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CdkTableModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, {useHash: true})
  ],
  declarations: [
    AppComponent,
    BaseJobComponent,
    IdentityJobComponent,
    IdentityCategoryHateJobComponent,
    TestJobComponent
  ],
  providers: [CrowdSourceApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
