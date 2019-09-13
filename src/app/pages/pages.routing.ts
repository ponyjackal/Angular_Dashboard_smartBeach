import { Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { TermsConditionsComponent } from './termsconditions/termsconditions.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import {UpdatePasswordComponent} from './updatepassword/update.component';

export const PagesRoutes: Routes = [

    {
        path: '',
        children: [{
            path: '',
            component: LoginComponent
        },{
            path: 'login',
            component: LoginComponent
        }, {
            path: 'lock',
            component: LockComponent
        }, {
            path: 'updatepassword',
            component: UpdatePasswordComponent
        }, {
            path: 'register',
            component: RegisterComponent
        },
        {
            path: 'termsconditions',
            component: TermsConditionsComponent
        }]
    }
];
