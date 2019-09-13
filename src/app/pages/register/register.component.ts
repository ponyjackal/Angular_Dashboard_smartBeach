import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, AppService, AssetService } from '../../services/index';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import * as $ from "jquery";
import * as _ from 'lodash';
@Component({
    selector: 'app-register-cmp',
    templateUrl: './register.component.html',
    styleUrls: ["./register.component.scss"]
})

export class RegisterComponent implements OnInit {
    test: Date = new Date();
    places = [];
    register: FormGroup;

    model: any = {};
    loading = false;
    termsConditions:any;
    countries: any = {};
    beachLoaded: boolean = false;
    changedBeachInfo = false;
    languages: any = [];
    selected_lang = 'ro';
    selected_name = 'romanian';
    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private router: Router,
        private translate: TranslateService,
        private appService: AppService,
        private assetService: AssetService
    ) {
        this.translate.use(this.appService.getLang());
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


            this.assetService.getTermsConditions().then((res) => {
                this.termsConditions=res.data.content;
                
            }).catch((error) => {
              
            });

         


            $(document).keypress(function (e) {
                if (e.which == 13) {
                    
                        $('#' + 'register').click();
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

    onRegister() {
        if (this.register.valid) {
            this.loading = true;
            this.userService.signup(this.model)
                .then((result) => {
                    this.router.navigateByUrl('/');
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
            this.validateAllFormFields(this.register);
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
       
        this.register = this.formBuilder.group({
            // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstName attribute must have a value in it.
            email: [null, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
            // We can use more than one validator per field. If we want to use more than one validator we have to wrap our array of validators with a Validators.compose function. Here we are using a required, minimum length and maximum length validator.
            number: [null, Validators.required],
            yourName: ['', Validators.required],
            companyName: ['', Validators.required],
            countryName: ['', Validators.required],
            PlaceName: ['', Validators.required],
            optionsCheckboxes: [null, Validators.required]

        });

        this.loading = true;
        this.assetService.getCountries()
        .then((countries) => {                   
            this.countries = countries;
            this.loading = false;
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

        
    }


    onChangeCountry(country) {
        let selectedCountry = _.filter(this.countries, { name: country });
        let country_id = selectedCountry[0]['id'];
         if (country_id) {
            this.changedBeachInfo = true;
             this.assetService.getPlaces(country_id).then((places) => {
                 this.places = places;
             })
      }
    }

    
}
