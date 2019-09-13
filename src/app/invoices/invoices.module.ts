import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';

import { InvoicesComponent } from './invoices.component';
import { InvoicesRoutes } from './invoices.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(InvoicesRoutes),
        FormsModule,
        MdModule,
        MaterialModule,
        TranslateModule,
    ],
    declarations: [
        InvoicesComponent
    ]
})

export class InvoicesModule {}