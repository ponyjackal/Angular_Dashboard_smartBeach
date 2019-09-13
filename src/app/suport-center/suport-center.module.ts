import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { LbdTableComponent } from '../lbd/lbd-table/lbd-table.component';

import { SuportCenterComponent } from './suport-center.component';
import { SuportCenterRoutes } from './suport-center.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SuportCenterRoutes),
        FormsModule,
        TranslateModule,
    ],
    declarations: [SuportCenterComponent]
})

export class SuportCenterModule {}
