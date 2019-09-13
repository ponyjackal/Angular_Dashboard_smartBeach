import { Routes } from '@angular/router';

import { BestPlanComponent } from './best-plan.component';

export const BestPlanRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: BestPlanComponent
    }]
}
];
