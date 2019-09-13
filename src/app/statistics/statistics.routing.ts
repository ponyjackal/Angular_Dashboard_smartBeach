import { Routes } from '@angular/router';

import { BeachStatusComponent } from './beach-status/beach-status.component';
import { CompareComponent } from './compare/compare.component';
import { CustomersComponent } from './customers/customers.component';
import { RatingAndReviewsComponent } from './rating-and-reviews/rating-and-reviews.component';

export const StatisticsRoutes: Routes = [
    {
      path: '',
      children: [ {
        path: 'compare',
        component: CompareComponent
    }]}, {
    path: '',
    children: [ {
      path: 'beach-status',
      component: BeachStatusComponent
    }]
    }, {
    path: '',
    children: [ {
      path: 'customers',
      component: CustomersComponent
    }]
    }, {
        path: '',
        children: [ {
            path: 'rating-and-reviews',
            component: RatingAndReviewsComponent
        }]
    }
];
