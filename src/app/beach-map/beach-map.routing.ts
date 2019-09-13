import { Routes } from '@angular/router';

import { ViewComponent } from './view/view.component';
import { ConfigurationComponent } from './configuration/configuration.component';

export const MapsRoutes: Routes = [
  {
    path: '',
    children: [{
      path: 'edit',
      component: ConfigurationComponent
    },
    {
      path: 'view',
      component: ViewComponent
    }]
  }
];
