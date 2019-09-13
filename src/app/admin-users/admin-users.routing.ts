import { Routes } from '@angular/router';

import { AdminUsersComponent } from './admin-users.component';

export const AdminUsersRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: AdminUsersComponent
    }]
}
];
