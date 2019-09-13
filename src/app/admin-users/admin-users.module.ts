import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { LbdTableComponent } from '../lbd/lbd-table/lbd-table.component';

import { AdminUsersComponent } from './admin-users.component';
import { AdminUsersRoutes } from './admin-users.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminUsersRoutes),
        FormsModule,
        TranslateModule,
    ],
    declarations: [AdminUsersComponent]
})

export class AdminUsersModule {}
