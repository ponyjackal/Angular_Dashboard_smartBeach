// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { UserService, AssetService, AppService } from '../services/index';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html'
})

export class ProfileComponent implements OnInit {
   
    profile : FormGroup;
    currentUser: any = {};
    countries: any = {};
    places: any = {};
    loading = false;
    placesloading = false;
    user: any = {};

    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private assetService: AssetService,
        private router: Router,
		private translate: TranslateService,
		private appService: AppService,
	) {
        this.translate.use(this.appService.getLang());
       
    }

    updateProfile(){
        const {name, phone, email, company, company_country, company_city, company_zipcode, company_address} = this.currentUser;
        this.userService.updateProfile({name, phone, email, company, company_country, company_city, company_zipcode, company_address})
            .then((result) => {                    
                this.router.navigateByUrl('/plans');
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
            }
        );

    }
    

    ngOnInit() {
       
        const storageData = JSON.parse(localStorage.getItem('currentUser'));
        this.currentUser = storageData ? storageData.account : {};
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
        /* if (this.currentUser.company_country !== null) {
            this.onChangeCountry();
        } */ 
        this.profile = this.formBuilder.group({
            // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstName attribute must have a value in it.
            email: [null, [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
            // We can use more than one validator per field. If we want to use more than one validator we have to wrap our array of validators with a Validators.compose function. Here we are using a required, minimum length and maximum length validator.
            number: [null , Validators.required],
            yourName: ['', Validators.required],
            companyName: ['', Validators.required],
            companyAddress: [''],
            companyCity: [''],
            companyCountry: [''],
            companyZipcode: ['']
         });  
    }    
}


