import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { MaterialModule } from '../app.module';

import { StatisticsRoutes } from './statistics.routing';

import { BeachStatusComponent } from './beach-status/beach-status.component';

import { CompareComponent } from './compare/compare.component';
import { CustomersComponent } from './customers/customers.component';
import { RatingAndReviewsComponent } from './rating-and-reviews/rating-and-reviews.component';
import { TranslateModule } from '@ngx-translate/core';
import { NumberInputComponent } from '../shared/number-input/number-input.component';
import { YearMonthInputComponent } from 'app/shared/year-month-input/year-month-input.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(StatisticsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    TranslateModule
  ],
  declarations: [
    BeachStatusComponent,
    CompareComponent,
    CustomersComponent,
    RatingAndReviewsComponent,
    NumberInputComponent,
    YearMonthInputComponent
  ]
})

export class StatisticsModule { }