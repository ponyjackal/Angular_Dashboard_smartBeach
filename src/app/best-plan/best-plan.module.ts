import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';

import { BestPlanComponent } from './best-plan.component';
import { BestPlanRoutes } from './best-plan.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(BestPlanRoutes),
        FormsModule,
        MdModule,
        MaterialModule,
        ReactiveFormsModule,
        TranslateModule,
    ],
    declarations: [
        BestPlanComponent       
    ]
})

export class BestPlanModule {}