import { Routes } from '@angular/router';

import { EmployeesComponent } from './employees.component';

export const EmployeesRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: EmployeesComponent
    }]
}
];
