import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BeachMenuRoutes } from './beach-menu.routing';

import { BeachMenuEditComponent } from './beach-menu-edit.component';
import { BeachMenuViewComponent } from './beach-menu-view.component';
import { BeachMenu } from './components/beach-menu.component';
import { BeachMenuCategory } from './components/beach-menu-category.component';
import { BeachMenuItem } from './components/beach-menu-item.component';
import { BeachMenuTab } from './components/beach-menu-tab.component';
import { MaterialModule } from '../app.module';
import { TranslateModule } from '@ngx-translate/core';
import { ItemEditComponent } from './components/item-edit.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(BeachMenuRoutes),
    MaterialModule,
    FormsModule,
    TranslateModule,
  ],
  declarations: [
      BeachMenuEditComponent,
      BeachMenuViewComponent,
      BeachMenu,
      BeachMenuCategory,
      BeachMenuItem,
      BeachMenuTab,
      ItemEditComponent,
  ],
  entryComponents: [
    BeachMenuTab,
    ItemEditComponent,
  ]
})

export class BeachMenuModule {}
