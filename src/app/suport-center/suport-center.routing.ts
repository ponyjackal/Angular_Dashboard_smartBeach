import { Routes } from '@angular/router';

import { SuportCenterComponent } from './suport-center.component';

export const SuportCenterRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: SuportCenterComponent
    }]
}
];
