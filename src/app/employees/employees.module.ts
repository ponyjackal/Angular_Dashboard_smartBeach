import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';

import { EmployeesComponent } from './employees.component';
import { EmployeeAddDialog } from './employees.component';
import { EmployeesRoutes } from './employees.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(EmployeesRoutes),
        FormsModule,
        MdModule,
        MaterialModule,
        ReactiveFormsModule,
        TranslateModule,
    ],
    declarations: [
        EmployeesComponent,
        EmployeeAddDialog
    ],
    entryComponents: [
        EmployeeAddDialog
    ]
})

export class EmployeesModule {}