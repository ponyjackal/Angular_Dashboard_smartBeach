import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { UserService, AssetService, AppService, BeachService } from '../services/index';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

declare const $: any

@Component({
    selector: 'best-plan-cmp',
    templateUrl: './best-plan.component.html'
})

export class BestPlanComponent implements OnInit {
    test: Date = new Date();
    loading = false;
    planList: any = [{}, {}]

    constructor(private element: ElementRef,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private assetService: AssetService,
        private router: Router,
        private beachService: BeachService,
        private translate: TranslateService,
        private appService: AppService,
    ) {
        this.translate.use(this.appService.getLang());
    }

    choosePlan(plan_id: number) {
        this.userService.choosePlan(plan_id)
            .then((result) => {
                this.appService.setAutoInfo({ account: result });
                this.translate.get('SETTINGS.BEACH_PLAN.SUCCESS_PLAN', { value: plan_id })
                    .subscribe(result => {
                        swal({
                            type: 'success',
                            title: 'Success',
                            confirmButtonClass: 'btn btn-info',
                            text: result,
                            buttonsStyling: false,
                        })
                            .then(result => {
                                this.router.navigateByUrl('settings/settings-about');
                            }).catch(() => {
                                this.router.navigateByUrl('settings/settings-about');
                            });
                    })
            })
            .catch(error => {
                if (error.type === 'auth') return;
                swal({
                    type: 'error',
                    title: '',
                    confirmButtonClass: 'btn btn-info',
                    text: error.message,
                    buttonsStyling: false,
                })
                    .then(result => {
                        this.router.navigateByUrl('profile');
                    }).catch(swal.noop);
            })
    }

    plan_id: number;

    ngOnInit() {
        this.loading = true;

        this.beachService.checkLogic(this.beachService.CHECK.PLAN)
            .then(() => {
                return this.assetService.getPlans();
            })
            .then(planList => {
                planList = planList.sort((a, b) => a.id > b.id);
                if (planList.length > 0) {
                    this.planList = planList;
                }
                this.plan_id = this.appService.authInfo.account.plan_id;
                this.loading = false;
                const className = `.plan_${this.plan_id}`;
                setTimeout(function () {
                    $(className).removeClass('card-plain');
                    $(className).addClass('card-rased');
                    $(className + ' a.btn').removeClass('btn-white');
                    $(className + ' a.btn').addClass('btn-rose');
                }, 50)
            })
            .catch(error => {
                if (error.type === 'auth') return;
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
                    })
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
}
