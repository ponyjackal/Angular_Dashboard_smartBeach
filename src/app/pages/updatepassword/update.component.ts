import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { PasswordValidation } from '../login/password-validator.component';

import { Router } from '@angular/router';
import { UserService, AppService } from '../../services/index';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

declare var $: any;

@Component({
    selector: 'app-password-cmp',
    templateUrl: './update.component.html'
})

export class UpdatePasswordComponent implements OnInit {
    test: Date = new Date();

    frmSetPass: FormGroup;

    model: any = {};
    loading = false;
    currentPassword: string;
    setPassword: string;
    confirmPassword: string;
    loaded = false;
    constructor(private formBuilder: FormBuilder,
        private userService: UserService,
        private router: Router,
        private translate: TranslateService,
        private appService: AppService,
    ) {
        this.translate.use(this.appService.getLang());
    }

    isFieldValid(form: FormGroup, field: string) {
        return !form.get(field).valid && form.get(field).touched;
    }

    displayFieldCss(form: FormGroup, field: string) {
        return {
            'has-error': this.isFieldValid(form, field),
            'has-feedback': this.isFieldValid(form, field)
        }
    }

    ngOnInit() {
        this.frmSetPass = this.formBuilder.group({
            currentPassword: ['', Validators.required],
            setPassword: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        }, {
            validator: PasswordValidation.MatchPassword // your validation method
        });
    }
    onUpdate(){
        if (this.frmSetPass.valid) {
            this.userService.updatePassword(this.currentPassword, this.setPassword)
                .then(() => {
                    swal({
                        type: 'success',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: this.translate.instant('PAGES.PASSWORD_UPDATED'),
                        buttonsStyling: false,
                    })
                    .then(() => {
                        this.router.navigateByUrl('/profile');
                    })
                    .catch(()=>{
                        this.router.navigateByUrl('/profile');
                    });
                })
                .catch(error => {
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                })
        }
    }
}
