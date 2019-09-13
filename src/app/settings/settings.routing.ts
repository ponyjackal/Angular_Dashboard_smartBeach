import { Routes } from '@angular/router';

import { BeachScheduleComponent } from './beach-schedule/beach-schedule.component';
import { SettingsAboutComponent } from './settings-about/settings-about.component';
import { CheckboxesComponent } from './checkboxes/checkboxes.component';

export const SettingsRoutes: Routes = [
    {
      path: 'settings-about',
      component: SettingsAboutComponent
    }, {
      path: 'beach-schedule',
      component: BeachScheduleComponent
    }, {
      path: 'checkboxes',
      component: CheckboxesComponent
    }
];
