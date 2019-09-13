// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';
import { AppService, BeachService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

declare const $: any;

@Component({
    selector: 'app-checkboxes-cmp',
    templateUrl: 'checkboxes.component.html',
    styleUrls: ['./checkboxes.component.css']
})

export class CheckboxesComponent implements OnInit {

    constructor(
        private beachService: BeachService,
        private router: Router,
        private translate: TranslateService,
        private appService: AppService,
    ) {
        this.translate.use(this.appService.getLang());
    }

    seats: any = {
        umbrella: [],
        baldaquin: [],
        sunbed: 0,
        extra: 0
    };
    plan_id = 0;
    card = false;
    photo_required = true;
    sunbeds_at_baldaquin = true;
    require_call = false;
    broker = false;
    have4Sunbed = false;
    without_pay_reserve = false;
    only_cc = false;
    // menu: boolean = false

    booking_time_limit = 0;
    extra_sunbeds = 0;
    cancel_daily_limit = 0;
    umbrella = {
        'person-num': {
            'one': {
                'occupy-all-seats': false
            },
            'two': {
                'occupy-all-seats': false
            }
        }
    };
    hour_release_points_hh = 0;
    hour_release_points_mm = 0;
    day_release_percent_to_points = 0;
    partial_day_release_percent_to_points = 0;

    saveSettings() {
       
        function pad(d) {
            if(d && d=='00'){
                return '00';
            }
            if(d && d.toString().length=='1'){
            return (d < 10) ? '0' + d.toString() : d.toString();
            }
            if(d && d.toString().length=='2'){
                return (d < 10) ? d.toString() : d.toString();
                }
            
            else{
                return '00';
            }
        };

        const {
            booking_time_limit,
            extra_sunbeds,
            cancel_daily_limit,
            card, broker, seats, umbrella, photo_required,sunbeds_at_baldaquin,require_call,without_pay_reserve,only_cc,
            day_release_percent_to_points,
            partial_day_release_percent_to_points,
        } = this;
        const hour_release_points = `${pad(this.hour_release_points_hh)}:${pad(this.hour_release_points_mm)}`;
        this.beachService.updateBeachSettings({
            booking_time_limit,
            extra_sunbeds,
            cancel_daily_limit,
            card, broker, seats, umbrella, photo_required,without_pay_reserve,only_cc,sunbeds_at_baldaquin,require_call,
            day_release_percent_to_points,
            partial_day_release_percent_to_points,
            hour_release_points
        })
            .then( () => {
                this.changedData = false;
                if (this.extra_sunbeds > 0) {
                    this.disable_extra = true;
                }
                if (this.seats.extra > 0) {
                    this.seat_extra = true;
                }
            })
            .catch(error => {
                if (error.type === 'auth') { return; }
                swal({
                    type: 'error',
                    title: '',
                    confirmButtonClass: 'btn btn-info',
                    text: error.message,
                    buttonsStyling: false,
                }).catch(swal.noop);
            });
    }
    changedData = false;
    disable_extra = false;
    seat_extra = false;

    ngOnInit() {
        this.plan_id = this.appService.authInfo.account.plan_id;

        this.beachService.checkLogic(this.beachService.CHECK.OPTIONS)
            .then(() => this.beachService.getBeach())
            .then(beach => {
                const { booking_time_limit,
                    extra_sunbeds,
                    cancel_daily_limit,
                    card, broker, seats, umbrella, photo_required,without_pay_reserve,only_cc,sunbeds_at_baldaquin,require_call,
                    day_release_percent_to_points,
                    partial_day_release_percent_to_points,
                    hour_release_points,
                } = beach.settings;
                this.booking_time_limit = booking_time_limit;
                this.extra_sunbeds = extra_sunbeds;
                this.booking_time_limit = booking_time_limit;
                this.cancel_daily_limit = cancel_daily_limit;
                this.umbrella = umbrella || this.umbrella;
                this.day_release_percent_to_points = day_release_percent_to_points;
                this.partial_day_release_percent_to_points = partial_day_release_percent_to_points;
                this.umbrella = umbrella || this.umbrella;
                try {
                    this.hour_release_points_hh = hour_release_points.split(':')[0];
                    this.hour_release_points_mm = hour_release_points.split(':')[1];
                } catch (error) {
                    this.hour_release_points_hh = 0;
                    this.hour_release_points_mm = 0;
                }
                if (this.extra_sunbeds > 0) {
                    this.disable_extra = true;
                }
                this.card = card;
                this.photo_required = photo_required;
                this.only_cc = only_cc;
                this.without_pay_reserve = without_pay_reserve;
                this.sunbeds_at_baldaquin = sunbeds_at_baldaquin;
                this.require_call = require_call;
                if (Object.keys(seats).length > 0) {
                    this.seats = seats;
                    if (this.seats.extra > 0) {
                        this.seat_extra = true;
                    }
                }
                this.broker = broker;
                this.changedData = false;
            })
            .catch(error => {
                if (error.type === 'auth') { return; }
                if (error.logicError) {
                    error.logicError.subscribe(result => {
                        swal({
                            type: 'error',
                            title: '',
                            confirmButtonClass: 'btn btn-info',
                            text: result,
                            buttonsStyling: false,
                        })
                            .then(() => {
                                this.router.navigateByUrl(error.url);
                            }).catch(() => {
                                this.router.navigateByUrl(error.url);
                            });
                    });
                } else {
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                }
            });
    }

    onChangePayReserve(status){
       
        if(status == false){
            this.card = false;
            this.photo_required = false;
            this.sunbeds_at_baldaquin = true;
            this.only_cc = false;
            this.without_pay_reserve = false;
            this.umbrella = {
                'person-num': {
                    'one': {
                        'occupy-all-seats': false
                    },
                    'two': {
                        'occupy-all-seats': false
                    }
                }
            };
            this.partial_day_release_percent_to_points = 0;
            this.day_release_percent_to_points = 0;
            this.cancel_daily_limit = 0;
            this.booking_time_limit = 0;
        }
        else{
            this.card = true;
            this.photo_required = true;
            this.sunbeds_at_baldaquin = true;
            this.only_cc = true;
            this.without_pay_reserve = true;
            this.umbrella = {
                'person-num': {
                    'one': {
                        'occupy-all-seats': true
                    },
                    'two': {
                        'occupy-all-seats': true
                    }
                }
            }; 
        }

    }

    onChangeCc(pay){
        if(this.without_pay_reserve == true){
        if(pay == false){
            this.only_cc = false;
            this.photo_required = true;
            this.sunbeds_at_baldaquin = true;
            this.umbrella = {
                'person-num': {
                    'one': {
                        'occupy-all-seats': true
                    },
                    'two': {
                        'occupy-all-seats': true
                    }
                }
            };
            //this.booking_time_limit = 0;
        }
        else{
          //  this.without_pay_reserve = true;
            this.photo_required = true;
            this.sunbeds_at_baldaquin = true;
            this.only_cc = true;
            this.umbrella = {
                'person-num': {
                    'one': {
                        'occupy-all-seats': true
                    },
                    'two': {
                        'occupy-all-seats': true
                    }
                }
            };
            this.booking_time_limit = 0;
        }
    }
    }
}

