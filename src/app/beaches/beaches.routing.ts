import { Routes } from '@angular/router';

import { BeachesComponent } from './beaches.component';

export const BeachesRoutes: Routes = [
    {
      path: '',
      children: [ {
        path: '',
        component: BeachesComponent
    }]
}
];
