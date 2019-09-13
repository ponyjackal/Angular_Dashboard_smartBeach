// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StatisticsService } from '../../services/statistics.service';
import * as moment from 'moment';

declare const swal: any;
declare const $: any;

@Component({
    selector: 'app-beach-status-cmp',
    templateUrl: 'beach-status.component.html'
})

export class BeachStatusComponent implements OnInit {

    constructor(
        private statistics: StatisticsService
    ) {
    }
    // date = new FormControl(new Date());
    // month = new FormControl(new Date());
    // year = new FormControl(new Date());
    today = moment().format('YYYY-MM-DD');
    thisweek = moment().startOf('week').format('YYYY-MM-DD') + '~' + moment().endOf('week').format('YYYY-MM-DD');
    thismonth = moment().startOf('month').format('MMMM YYYY');
    thisyear = moment().startOf('year').format('YYYY');

    data: any;
    loaded = false;
    ngOnInit() {
        this.statistics.getBeachStatus()
            .then(data => {
                this.data = data;
                return this.statistics.getBeachStatusAll();
            })
            .then(data => {
                this.loaded = true;

                const $calendar = $('#fullCalendar');

                const calendarEvents = [];
                // color classes: [ event-azure | event-azure | event-green | event-orange | event-red ]
                data.forEach(item => {
                    const time = moment(item.created_at);
                    if (item.booked) {
                        calendarEvents.push({
                            id: calendarEvents.length,
                            title: `Booked ${item.seat_type}: ${item.booked}`,
                            start: time,
                            className: 'event-puple'
                        });
                    }
                    if (item.occupied) {
                        calendarEvents.push({
                            id: calendarEvents.length,
                            title: `Occupied ${item.seat_type}: ${item.occupied}`,
                            start: time,
                            className: item.seat_type === 'seat' ? 'event-green' : 'event-black'
                        });
                    }
                    if (item.completed) {
                        calendarEvents.push({
                            id: calendarEvents.length,
                            title: `Completed ${item.seat_type}: ${item.completed}`,
                            start: time,
                            className: 'event-orange'
                        });
                    }
                    if (item.released) {
                        calendarEvents.push({
                            id: calendarEvents.length,
                            title: `Released ${item.seat_type}: ${item.released}`,
                            start: time,
                            className: item.seat_type === 'seat' ? 'event-green' : 'event-azure'
                        });
                    }
                    if (item.expired) {
                        calendarEvents.push({
                            id: calendarEvents.length,
                            title: `Expired ${item.seat_type}: ${item.expired}`,
                            start: time,
                            className: 'event-red'
                        });
                    }
                    if (item.canceled) {
                        calendarEvents.push({
                            id: calendarEvents.length,
                            title: `Canceled ${item.seat_type}: ${item.canceled}`,
                            start: time,
                            className: 'event-orange'
                        });
                    }
                });

                $calendar.fullCalendar({
                    // viewRender: function (view: any, element: any) {
                    //     if (view.name !== 'month') {
                    //         const $fc_scroller = $('.fc-scroller');
                    //         $fc_scroller.perfectScrollbar();
                    //     }
                    // },
                    header: {
                        left: '',
                        center: 'title',
                        right: 'prev, today, next'
                    },
                    defaultDate: new Date(),
                    selectable: true,
                    selectHelper: true,
                    fixedWeekCount: false,
                    views: {
                        month: {
                            titleFormat: 'MMMM YYYY'
                        },
                        week: {
                            titleFormat: 'MMMM D YYYY'
                        },
                        day: {
                            titleFormat: 'D MMM, YYYY'
                        }
                    },

                    eventLimit: true,
                    eventOrder: 'id',
                    eventLimitText: 'Info',
                    events: calendarEvents,
                    displayEventTime: false
                });
            });

    }
}
