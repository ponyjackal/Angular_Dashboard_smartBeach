import { Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../models/index';
import { environment } from '../../environments/environment';
import { AppService } from './app.service';

@Injectable()
export class UserService {

    constructor(
        private appService: AppService,
    ) {
        const { account } = this.appService.authInfo;
    }

    forgot_pass(user: User) {
        return this.appService.post('client/resetpassword/request', user, true)
            .then(res => res.succes);
    }

    reset_pass(user: User, resetcode: string) {
        return this.appService.post('client/resetpassword/' + resetcode, user, true)
            .then(res => res.succes);
    }

    async login(username: string, password: string) {
        try {
            const res = await this.appService.post('client/signin', { username, password }, true);
            this.appService.setAutoInfo(res.data);
            return res.data;
        } catch (error) {
            throw error;
        }
    }

    async updateProfile(user) {
        try {
            const res = await this.appService.post('client/update', user);
            this.appService.setAutoInfo({ account: res.data });
            return true;
        } catch (error) {
            throw error;
        }
    }

    async confirmPin(params){

        return this.appService.post('client/confirm-pin', params, true)
            .then(res => res.succes);

    }
    async updatePassword(currentpassword, newpassword) {
        try {
            const res = await this.appService.post('client/updatepassword', {currentpassword, newpassword});
            return true;
        } catch (error) {
            throw error;
        }
    }

    signup(user: User) {
        return this.appService.post('client/signup', user, true)
            .then(res => res.data);
    }

    getEmployees() {
        return this.appService.get('employee')
            .then(res => res.data);
    }

    choosePlan(plan_id: number) {
        return this.appService.get('client/chooseplan/' + plan_id)
            .then(res => res.data);
    }
    addEmployee(employee) {
        return this.appService.post('employee', employee)
            .then(res => res.data);
    }
    updateEmployee(employee) {
        return this.appService.post('employee/update', employee)
            .then(res => res.data);
    }
    async removeEmployee(id) {
        const beach = await this.appService.getBeach();
        return await this.appService.get(`employee/${beach.id}/${id}`)
            .then(res => res.data);
    }
    logout() {
        this.appService.clear();
        localStorage.removeItem('currentUser');
    }

    getClientById(id) {
        return this.appService.get(`client/getclient/${id}`)
        .then(res => res.data);
    }
}
