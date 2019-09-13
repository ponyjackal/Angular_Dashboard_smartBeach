import { Routes } from '@angular/router';

import { NewRegisterComponent } from './new-register.component';

export const NewRegisterRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: NewRegisterComponent
    }]
}
];
