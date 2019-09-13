import { Routes } from '@angular/router';

import { BeachMenuViewComponent } from './beach-menu-view.component';
import { BeachMenuEditComponent } from './beach-menu-edit.component';


export const BeachMenuRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: 'view',
            component: BeachMenuViewComponent
        }]
    }, {
        path: '',
        children: [ {
            path: 'add-edit-delete',
            component: BeachMenuEditComponent
        }]
    }
];
