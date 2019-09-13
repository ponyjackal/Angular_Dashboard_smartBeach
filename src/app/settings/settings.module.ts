import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { MaterialModule } from '../app.module';
import { SettingsRoutes } from './settings.routing';

import { BeachScheduleComponent } from './beach-schedule/beach-schedule.component';
import { SettingsAboutComponent } from './settings-about/settings-about.component';
import { CheckboxesComponent } from './checkboxes/checkboxes.component';

import { UserService } from '../services/index';
import { SimpleTimePicker } from './timepicker/simple-timepicker.component';
import { SimpleTimePickerDialog } from './timepicker/simple-timepicker-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SettingsRoutes),
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    TranslateModule,
  ],
  declarations: [
    BeachScheduleComponent,
    SettingsAboutComponent,
    CheckboxesComponent,
    SimpleTimePicker,
    SimpleTimePickerDialog
  ],
  providers: [
    UserService,
  ],
  entryComponents: [
    SimpleTimePickerDialog,
  ]
})

export class SettingsModule { }
