import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { LbdTableComponent } from '../lbd/lbd-table/lbd-table.component';
import { BeachesProductsComponent } from './beach-product';
import { BeachesComponent } from './beaches.component';
import { BeachesRoutes } from './beaches.routing';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(BeachesRoutes),
        FormsModule,
        TranslateModule,
        InfiniteScrollModule
    ],
    declarations: [BeachesProductsComponent, BeachesComponent]
})

export class BeachesModule {}
