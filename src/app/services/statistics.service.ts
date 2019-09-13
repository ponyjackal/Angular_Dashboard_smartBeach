import { Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../models/index';
import { environment } from '../../environments/environment';
import { AppService } from './app.service';

@Injectable()
export class StatisticsService {

    constructor(
        private appService: AppService,
    ) {
        // const { account } = this.appService.authInfo;
    }

    async getBeachStatus() {
        try {
            const beach = await this.appService.getBeach();

            const res = await this.appService.get('statistics/beach-status', {beach_id: beach.id});
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    async getBeachStatusAll() {
        try {
            const beach = await this.appService.getBeach();

            const res = await this.appService.get('statistics/beach-status/all', {beach_id: beach.id});
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    async getSummeryStatForToday() {
        try {
            const beach = await this.appService.getBeach();

            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth();
            const d = date.getDate();

            const res = await this.appService.post('statSeat/getSeatStatByDate', {
                date: new Date(Date.UTC(year, month, d)),
                beachId: beach.id
            });

            console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }

    async getDailyStat(year, month, date) {
        try {
            const beach = await this.appService.getBeach();

            const res = await this.appService.post('statSeat/getSeatStatByDate/independent/daily', {
                date: new Date(Date.UTC(year, month, date)),
                beachId: beach.id
            });

            return res;
        } catch(err) {
            throw err;
        }
    }

    async getWeeklyStat(year, month, date) {
        try {
            const beach = await this.appService.getBeach();

            const res = await this.appService.post('statSeat/getSeatStatByDate/independent/weekly', {
                date: new Date(Date.UTC(year, month, date)),
                beachId: beach.id
            });

            console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }

    async getMonthlyStat(year, month) {
        try {
            const beach = await this.appService.getBeach();

            const res = await this.appService.post('statSeat/getSeatStatByDate/independent/monthly', {
                year: year,
                month: month,
                beachId: beach.id
            });

            console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }

    async getYearlyStat(year) {
        try {
            const beach = await this.appService.getBeach();

            const res = await this.appService.post('statSeat/getSeatStatByDate/independent/yearly', {
                year: year,
                beachId: beach.id
            });

            console.log(res);
            return res;
        } catch(err) {
            throw err;
        }
    }
}
