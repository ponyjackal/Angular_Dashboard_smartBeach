import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { PasswordValidation } from './password-validator.component';

import { Router, ActivatedRoute } from '@angular/router';
import { UserService, AppService, AssetService } from '../../services/index';
//import { User } from '../../models/index';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

declare var $: any;

declare interface validatorFn {
    (c: AbstractControl): {
        [key: string]: any;
    };
}

/* declare interface User {
    text?: string; //required, must be 5-8 charactors
    email?: string; //required, must be valid email format
} */

@Component({
    selector: 'app-login-cmp',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
    test: Date = new Date();

    //public typeValidation: User;
    frmLogin: FormGroup;
    frmSetEmail: FormGroup;
    frmConfirmPin: FormGroup;
    frmSetPass: FormGroup;

    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;

    login_state: number = 0;
    username: string;
    password: string;
    model: any = {};
    loading = false;
    setEmail: string;
    phoneNumber: string;
    setPassword: string;
    pinCode: string;
    result: any = {};
    //user : User;  
    loaded = false;

    languages: any = [];
    selected_lang = 'ro';
    selected_name = 'romanian';
    constructor(private element: ElementRef,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private router: Router,
        private translate: TranslateService,
        private appService: AppService,
        private assetService: AssetService
    ) {
        this.translate.use(this.appService.getLang());
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        this.login_state = 0;
        this.assetService.getLanguages()
            .then(languages => {
                this.languages = languages;
                this.selected_lang = this.appService.getLang();
                this.languages.forEach(item => {
                    if (item.name == this.selected_lang) {
                        this.selected_name = item.long_name;
                    }
                })
            })
            .catch(error => {
                this.languages = [];
                this.selected_lang = 'ro';
            });
            $(document).keypress(function (e) {
             
                if (e.which == 13) {
                    if(this.login_state==0){
                    $('#' + 'login-btn').click();
                    }
                    else if(this.login_state==1){
                        $('#' + 'forget-pwd').click();
                    }
                    else if(this.login_state>1){
                        $('#' + 'cnfrm-pin').click();
                    }
                }
            }.bind(this));
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

    changeLanguage(index) {
        this.selected_lang = this.languages[index].name;
        this.selected_name = this.languages[index].long_name;
        this.appService.setLang(this.selected_lang);
        this.translate.use(this.selected_lang);
    }
    onLogin() {
        if (this.frmLogin.valid) {
            
            this.loading = true;
            this.userService.login(this.username, this.password)
                .then((result) => {
                    if(result.account.client_type == 'superadmin'){
                        //this.router.navigateByUrl('/new-register');
                        window.location.href='/new-register';
                    }
                else{
                    window.location.href='/profile';
                }
                   
                    //window.location.href='/profile';
                })
                .catch(error => {
                    if (error.type === 'auth') return;
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                    this.loading = false;
                });
        } else {
            this.validateAllFormFields(this.frmLogin);
        }
    }

    forgot_pass() {
        this.login_state = 1;
        this.frmSetEmail = this.formBuilder.group({
            setEmail: [null, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
            // phoneNumber: [null, Validators.required]
        }, {
                //validator: PasswordValidation.MatchPassword // your validation method
            });
    }

    go_confirm_pin() {

        //this.loading = true;

        if (this.frmSetEmail.valid) {
            this.loading = true;
            this.model.email = this.setEmail;
            this.userService.forgot_pass(this.model)
                .then((result) => {
                    this.login_state = 2;
                    this.frmConfirmPin = this.formBuilder.group({
                        pinCode: [null, Validators.required]
                    }, {
                            //validator: PasswordValidation.MatchPassword // your validation method
                        });

                })
                .catch(error => {
                    if (error.type === 'auth') return;
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                    this.loading = false;
                }
                );
        } else {
            this.validateAllFormFields(this.frmSetEmail);
        }
    }

    confirm_pin() {
        if (this.login_state === 2) {
            //this.login_state = 3;
            if (this.frmConfirmPin.valid) {
                this.loading = true;
                let params={
                    email:this.setEmail,
                    code:this.pinCode
                }
                this.userService.confirmPin(params)
                .then((result) => {
                    this.login_state = 3;
                })
                .catch(error => {
                    this.pinCode = "";
                    this.login_state = 2;
                    this.loading = false;
                });

                

                
                this.frmSetPass = this.formBuilder.group({
                    setPassword: ['', Validators.required],
                    confirmPassword: ['', Validators.required]
                }, {
                        validator: PasswordValidation.MatchPassword // your validation method
                    });

                //    })
                //    .catch(error => {
                //            this.loading = false;
                //        }
                //    );         
            } else {
                this.validateAllFormFields(this.frmSetEmail);
            }
        } else {

            if (this.frmSetPass.valid) {
                this.loading = true;
                this.model.password = this.setPassword;
                this.userService.reset_pass(this.model, this.pinCode)
                    .then((result) => {
                        this.login_state = 0;
                        /* this.frmSetPass = this.formBuilder.group({
                            setpassword: ['', Validators.required],
                            confirmPassword: ['', Validators.required]           
                        }, {
                            validator: PasswordValidation.MatchPassword // your validation method
                        });  */

                    })
                    .catch(error => {
                        if (error.type === 'auth') return;
                        swal({
                            type: 'error',
                            title: '',
                            confirmButtonClass: 'btn btn-info',
                            text: error.message,
                            buttonsStyling: false,
                        }).catch(swal.noop);
                        this.loading = false;
                    });
            } else {
                this.validateAllFormFields(this.frmSetEmail);
            }
        }
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }


    ngOnInit() {
        var navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

        this.frmLogin = this.formBuilder.group({
            email: [null, [Validators.required]],
            password: ['', Validators.required],
        }, {});
        this.appService.getBeach()
            .then(beach => {
                this.router.navigateByUrl('/settings/settings-about');
            })
            .catch(error => {
                setTimeout(function () {
                    $('.card').removeClass('card-hidden');
                }, 700);
            })
    }

    sidebarToggle() {
        
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible === false) {
            setTimeout(function () {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
    // keypressOnPassword(event) {
    //     if (event.key === 'Enter') {
    //         $('button.login').trigger('click');
    //     }
    // }

}
