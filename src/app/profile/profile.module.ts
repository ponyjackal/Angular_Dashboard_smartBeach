import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdModule } from '../md/md.module';
import { MaterialModule } from '../app.module';

import { ProfileComponent } from './profile.component';
import { ProfileRoutes } from './profile.routing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ProfileRoutes),
        FormsModule,
        MdModule,
        MaterialModule,
        ReactiveFormsModule,
        TranslateModule,
    ],
    declarations: [
        ProfileComponent       
    ]
})

export class ProfileModule {}