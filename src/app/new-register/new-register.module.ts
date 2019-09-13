import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { LbdTableComponent } from '../lbd/lbd-table/lbd-table.component';

import { NewRegisterComponent } from './new-register.component';
import { NewRegisterRoutes } from './new-register.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(NewRegisterRoutes),
        FormsModule,
        TranslateModule,
    ],
    declarations: [NewRegisterComponent]
})

export class NewRegisteredModule {}
