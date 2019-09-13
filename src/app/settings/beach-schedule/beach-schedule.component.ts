import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { DateAdapter, MatFormFieldControl, MatDatepicker } from '@angular/material';
import { FormControl } from '@angular/forms';
import { BeachService, AppService } from '../../services';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as  moment from 'moment';

declare const require: any;

declare const $: any;

@Component({
    selector: 'app-beach-cmp',
    templateUrl: 'beach-schedule.component.html',
    styleUrls: ['./beach-schedule.component.scss']
})

export class BeachScheduleComponent implements OnInit {

    constructor(
        private beachService: BeachService,
        private translate: TranslateService,
        private appService: AppService,
        private router: Router,
    ) {
        this.translate.use(this.appService.getLang());
    }

    changedPeriod = false;
    changedHours = false;
    changedPrice = false;
    umbrellaChecked = false;
    sunbedChecked = false;
    baldaquinChecked = false;
    priceObj:any = {
        baldaquin:'',
        umbrella:'',
        sunbed:'',
    };
    
    

    /************* Working Hours **************** */
    working_hours = {
        start: {
            hour: 0,
            minute: 0
        },
        end: {
            hour: 0,
            minute: 0
        }
    };

    setStartTime(time) {
        this.changedHours = true;
        this.working_hours.start = time;
    }
    
	setEndTime(time) {
        this.changedHours = true;
        this.working_hours.end = time;
    }

    saveWorkingHours() {
        const working_hours = {
            start: `${('0' + this.working_hours.start.hour).slice(-2)}:${('0' + this.working_hours.start.minute).slice(-2)}`,
            end: `${('0' + this.working_hours.end.hour).slice(-2)}:${('0' + this.working_hours.end.minute).slice(-2)}`,
        };
        this.beachService.updateBeachSettings({ working_hours })
            .then(beach_settings => {
                this.changedHours = false;
            })
            .catch(error => {
                if (error.type === 'auth') {
                    return;
                }
                swal({
                    type: 'error',
                    title: '',
                    confirmButtonClass: 'btn btn-info',
                    text: error.message,
                    buttonsStyling: false,
                }).catch(swal.noop);
            });
    }

    /************* Working Dates **************** */
    working_dates = [{
        start: new FormControl(new Date()),
        end: new FormControl(new Date()),
        min: new Date(),
        max: new Date(new Date().getFullYear(), 11, 31),
        active: true,
    }];
    startDate = new FormControl(new Date(2018, 4, 10));
    endDate = new FormControl(new Date(2018, 5, 30));

    currentYear = 1900;

    saveWorkingDates() {
        const working_dates = this.working_dates.map(item => {
            return {
                start: {
                    month: `0${item.start.value.getMonth() + 1}`.slice(-2),
                    day: `0${item.start.value.getDate()}`.slice(-2),
                },
                end: {
                    month: `0${item.end.value.getMonth() + 1}`.slice(-2),
                    day: `0${item.end.value.getDate()}`.slice(-2),
                },
                active: item.active
            };
        });
        this.beachService.updateBeachSettings({ working_dates })
            .then(beach_settings => {
                this.changedPeriod = false;
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
    addNewYear() {
        if (!this.loaded) { return; }
        if (this.working_dates.length > 1) { return; }
        const today = new Date(); today.setFullYear(today.getFullYear() + 1);
        this.working_dates.push({
            start: new FormControl(today),
            end: new FormControl(today),
            min: new Date(this.currentYear + this.working_dates.length, 0, 1),
            max: new Date(this.currentYear +  + this.working_dates.length, 11, 31),
            active: false
        });
        this.periods_prices.periods.push([]);
    }

    /************* Currency */
    currency;

    private periods_prices = {
        periods: []
    };

    /***************  Seats Price ************* */

    addNewPeriodForPrice(index) {
        if (!this.loaded) { return; }
        let newPeriod: any = false;

        this.periods_prices.periods[index] = this.periods_prices.periods[index] || [];
        if (this.periods_prices.periods[index].length === 0) {
            newPeriod = {
                min: this.working_dates[index].start,
                max: this.working_dates[index].end,
                start: new FormControl(new Date(this.working_dates[index].start.value)),
                end: new FormControl(new Date(this.working_dates[index].end.value))
            };
        } else {
            const endDate = new Date(this.periods_prices.periods[index][this.periods_prices.periods[index].length - 1].end.value);
            if (endDate.getTime() === this.working_dates[index].end.value.getTime()) { return; }
            endDate.setDate(endDate.getDate() + 1);
            newPeriod = {
                min: this.periods_prices.periods[index][this.periods_prices.periods[index].length - 1].end,
                max: this.working_dates[index].end,
                start: new FormControl(endDate),
                end: new FormControl(new Date(this.working_dates[index].end.value))
            };
        }
        const periodKey = newPeriod.start.value + '_' + newPeriod.end.value;
        this.periods_prices.periods[index].push({
            key: periodKey,
            ...newPeriod
        });
        this.periods_prices[periodKey] = {
            sunbed: {
                front: [0, 0, 0, 0, 0, 0, 0],
                middle: [0, 0, 0, 0, 0, 0, 0],
                back: [0, 0, 0, 0, 0, 0, 0],
            },
            umbrella: {
                front: [0, 0, 0, 0, 0, 0, 0],
                middle: [0, 0, 0, 0, 0, 0, 0],
                back: [0, 0, 0, 0, 0, 0, 0],
            },
            baldaquin: {
                front: [0, 0, 0, 0, 0, 0, 0],
                middle: [0, 0, 0, 0, 0, 0, 0],
                back: [0, 0, 0, 0, 0, 0, 0],
            },
        };
    }

    savePrices() {
        if (!this.loaded) {
            return;
        }
        const seats_price = {
            front: {
                umbrella: {
                    periods: []
                },
                baldaquin: {
                    periods: []
                }, sunbed: {
                    periods: []
                }
            },
            middle: {
                umbrella: {
                    periods: []
                },
                baldaquin: {
                    periods: []
                }, sunbed: {
                    periods: []
                }
            },
            back: {
                umbrella: {
                    periods: []
                },
                baldaquin: {
                    periods: []
                }, sunbed: {
                    periods: []
                }
            }
        };

        this.periods_prices.periods.forEach(periodArray => {
            periodArray.forEach(period => {
                const { start, end } = {
                    start: moment(period.start.value).format('YYYY-MM-DD'),
                    end: moment(period.end.value).format('YYYY-MM-DD'),
                };

                const umbrella = this.periods_prices[period.key].umbrella;
                seats_price.front.umbrella.periods.push({
                    price: umbrella.front,
                    start,
                    end
                });
                seats_price.middle.umbrella.periods.push({
                    price: umbrella.middle,
                    start,
                    end
                });
                seats_price.back.umbrella.periods.push({
                    price: umbrella.back,
                    start,
                    end
                });

                const baldaquin = this.periods_prices[period.key].baldaquin;
                seats_price.front.baldaquin.periods.push({
                    price: baldaquin.front,
                    start,
                    end
                });
                seats_price.middle.baldaquin.periods.push({
                    price: baldaquin.middle,
                    start,
                    end
                });
                seats_price.back.baldaquin.periods.push({
                    price: baldaquin.back,
                    start,
                    end
                });

                const sunbed = this.periods_prices[period.key].sunbed;
                seats_price.front.sunbed.periods.push({
                    price: sunbed.front,
                    start,
                    end
                });
                seats_price.middle.sunbed.periods.push({
                    price: sunbed.middle,
                    start,
                    end
                });
                seats_price.back.sunbed.periods.push({
                    price: sunbed.back,
                    start,
                    end
                });

                              
            });
        });
        this.beachService.updateBeachSettings({ seats_price, currency: this.currency })
            .then(beach_settings => {
                this.changedPrice = false;
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

    loaded = false;
    ngOnInit() {
        this.currentYear = new Date().getFullYear();
        this.beachService.checkLogic(this.beachService.CHECK.BEACH_SCHEDULE)
            .then(() => {
                return this.beachService.getBeach();
            })
            .then(beach => {
                return beach.settings;
            })
            .then(beach_settings => {

                this.currency = beach_settings.currency;

                // load working_hours
                const working_hours = JSON.parse(JSON.stringify(beach_settings.working_hours));
                if (Object.keys(working_hours).length === 2) {
                    this.working_hours.start = {
                        hour: parseInt(working_hours.start.split(':')[0], 10),
                        minute: parseInt(working_hours.start.split(':')[1], 10)
                    };
                    this.working_hours.end = {
                        hour: parseInt(working_hours.end.split(':')[0], 10),
                        minute: parseInt(working_hours.end.split(':')[1], 10)
                    };
                }

                // load working_dates
                let working_dates = JSON.parse(JSON.stringify(beach_settings.working_dates));
                if (working_dates.length > 0) {
                    let existsActived = false;
                    for (let i = 0; i < working_dates.length; i++) {
                        if (working_dates[i].active === true) {
                            working_dates.slice(0, i);
                            existsActived = true;
                            break;
                        }
                    }

                    if (!existsActived) {
                        working_dates[0].active = true;
                    }
                    this.currentYear = new Date().getFullYear();
                    working_dates = working_dates.map((item, index) => {
                        item.start = new FormControl(new Date(this.currentYear + index, parseInt(item.start.month, 10) - 1, parseInt(item.start.day, 10)));
                        item.end = new FormControl(new Date(this.currentYear + index, parseInt(item.end.month, 10) - 1, parseInt(item.end.day, 10)));
                        if (index === 0) {
                            item.min = new Date();
                        } else {
                            item.min = new Date(this.currentYear + index, 0, 0);
                        }
                        item.max = new Date(this.currentYear + index, 11, 31);
                        return item;
                    });
                    this.working_dates = working_dates;
                }
                // load prices
                const seats_price = beach_settings.seats_price;
                if (seats_price.front && seats_price.front.umbrella) {
                    const periods = seats_price.front.umbrella.periods;
                    const periods_prices = {
                        periods: working_dates.map(item => [])
                    };
                    if (periods) {
                                        periods.forEach(item => {
                            const key = item.start + '_' + item.end;
                            const periodIndex = new Date(item.start).getFullYear() - this.currentYear;
                            periods_prices.periods[periodIndex] = periods_prices.periods[periodIndex] || [];
                            const beforIndex = periods_prices.periods[periodIndex].length - 1;

                            const start = new FormControl(new Date(item.start));
                            const end = new FormControl(new Date(item.end));
                            working_dates[periodIndex] = working_dates[periodIndex] || {};
                            let min = working_dates[periodIndex].start || {};
                            const max = working_dates[periodIndex].end || {};

                            if (beforIndex > -1) {
                                min = periods_prices.periods[periodIndex][beforIndex].end;
                                periods_prices.periods[periodIndex][beforIndex].max = start;
                            }

                            const period = { start, end, min, max };

                            periods_prices.periods[periodIndex].push({
                                key,
                                ...period
                            });
                            periods_prices[key] = {
                                sunbed: [],
                                umbrella: {},
                                baldaquin: {},
                            };
                        });
                        Object.keys(seats_price).forEach(secondKey => {
                            if (secondKey === 'sunbed') {
                                /* seats_price[secondKey].periods.forEach(item => {
                                    const period_key = item.start + '_' + item.end;
                                    const price = [].concat(item.price);
                                    periods_prices[period_key][secondKey] = price;
                                }); */
                               
                            } else {
                                Object.keys(seats_price[secondKey]).forEach(firstKey => {
                                    seats_price[secondKey][firstKey].periods.forEach(item => {
                                        const period_key = item.start + '_' + item.end;
                                        const price = [].concat(item.price);
                                        periods_prices[period_key][firstKey][secondKey] = price;
                                    });
                                });
                            }
                        });
                    }
                    this.periods_prices = periods_prices;
                }
                else{
                            }

                setTimeout(function () {
                    this.loaded = true;
                    this.changedPeriod = false;
                    this.changedHours = false;
                    this.changedPrice = false;
                }.bind(this), 200);
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

    onUmbrellaCheck(event,period){
        this.umbrellaChecked = event.currentTarget.checked;
    }
    onSunbedCheck(event,period){
        this.sunbedChecked = event.currentTarget.checked;
    }
    onBaldaquinCheck(event,period){
        this.baldaquinChecked = event.currentTarget.checked;
    }
    onTypePrice(event,period,periods_prices,type){
        let num = event.currentTarget.value;
        let periodbj =periods_prices[period.key];
       // let types = Object.keys(periodbj);
        let zones = ['front','back','middle'];
       
            zones.map((zone) =>{
                for(let i=0;i<periodbj[type][zone].length;i++) {
                    periodbj[type][zone][i] = num;
                }
            });
        
        

    }
}
