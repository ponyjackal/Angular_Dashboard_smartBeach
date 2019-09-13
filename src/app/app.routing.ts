import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';

export const AppRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [{
            path: '',
            loadChildren: './pages/pages.module#PagesModule'
        }]
    }, {
        path: '',
        component: AdminLayoutComponent,
        children: [
            {
                path: 'settings',
                loadChildren: './settings/settings.module#SettingsModule'
            }, {
                path: 'employees',
                loadChildren: './employees/employees.module#EmployeesModule'
            }, {
                path: 'beach-map',
                loadChildren: './beach-map/beach-map.module#BeachMapModule'
            }, {
                path: 'beach-menu',
                loadChildren: './beach-menu/beach-menu.module#BeachMenuModule'
            }, {
                path: 'statistics',
                loadChildren: './statistics/statistics.module#StatisticsModule'
            }, {
                path: 'suport-center',
                loadChildren: './suport-center/suport-center.module#SuportCenterModule'
            }, {
                path: 'invoices',
                loadChildren: './invoices/invoices.module#InvoicesModule'
            }, {
                path: 'plans',
                loadChildren: './best-plan/best-plan.module#BestPlanModule'
            }, {
                path: 'profile',
                loadChildren: './profile/profile.module#ProfileModule'
            },
             {
                 path: 'users',
                 loadChildren: './users/users.module#UsersModule'
             },
             {
                path: 'user',
                loadChildren: './admin-users/admin-users.module#AdminUsersModule'
            },
             {
                path: 'new-register',
                loadChildren: './new-register/new-register.module#NewRegisteredModule'
            },
            {
                path: 'beaches',
                loadChildren: './beaches/beaches.module#BeachesModule'
            }
        ]
    }
];
