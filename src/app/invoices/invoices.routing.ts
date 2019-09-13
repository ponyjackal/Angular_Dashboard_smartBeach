import { Routes } from '@angular/router';

import { InvoicesComponent } from './invoices.component';

export const InvoicesRoutes: Routes = [
    {

      path: '',
      children: [ {
        path: '',
        component: InvoicesComponent
    }]
}
];
