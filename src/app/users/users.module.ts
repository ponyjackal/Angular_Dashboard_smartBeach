import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
// import { LbdTableComponent } from '../lbd/lbd-table/lbd-table.component';

import { UsersComponent } from './users.component';
import { UsersRoutes } from './users.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(UsersRoutes),
        FormsModule,
        TranslateModule,
        InfiniteScrollModule
    ],
    declarations: [UsersComponent]
})

export class UsersModule {}
