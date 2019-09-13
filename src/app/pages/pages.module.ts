import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { MdIconModule, MdCardModule, MdInputModule, MdCheckboxModule, MdButtonModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { PagesRoutes } from './pages.routing';

import { RegisterComponent } from './register/register.component';
import { TermsConditionsComponent } from './termsconditions/termsconditions.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';

import { UserService } from '../services/index';
import { FieldErrorDisplayComponent } from './field-error-display/field-error-display.component';
import { TranslateModule } from '@ngx-translate/core';
import { UpdatePasswordComponent } from './updatepassword/update.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PagesRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    TermsConditionsComponent,
    LockComponent,
    FieldErrorDisplayComponent,
    UpdatePasswordComponent,
  ],
  providers: [
    UserService,
  ]
})

export class PagesModule {}
