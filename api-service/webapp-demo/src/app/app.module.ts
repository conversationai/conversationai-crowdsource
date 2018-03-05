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
import { TestJobComponent } from './test_job.component';
import { CrowdSourceApiService} from './crowd_source_api.service';

// TODO(rachelrosen): Make some or all of these optional parameters instead of
// route parameters.
const appRoutes: Routes = [
  // TODO(rachelrosen): Delete the path without the custom job key, since that
  // should be required for all jobs.
  {
    path: 'test_job',
    component: TestJobComponent
  },
  {
    path: 'test_job/:customClientJobKey',
    component: TestJobComponent
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
    TestJobComponent
  ],
  providers: [CrowdSourceApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
