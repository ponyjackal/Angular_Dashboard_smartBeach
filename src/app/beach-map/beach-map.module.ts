import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

import { MapsRoutes } from './beach-map.routing';
import { KonvaModule } from 'ng2-konva';
import { NouisliderModule } from 'ng2-nouislider';

import { ViewComponent } from './view/view.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../app.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MapsRoutes),
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
    }),
    KonvaModule,
    NouisliderModule,
    TranslateModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [
      ViewComponent,
      ConfigurationComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class BeachMapModule {}
