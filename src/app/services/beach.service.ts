import { Injectable, Inject } from '@angular/core';
import axios from 'axios';
import { User } from '../models/index';
import { environment } from '../../environments/environment';
import { AppService } from './app.service';
import { Beach } from '../models/beach';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';
import { Router } from '@angular/router';

import { Subject, Observable } from 'rxjs/';

@Injectable()
export class BeachService {
    public categoryList = {};
    constructor(
        private userService: UserService,
        private appService: AppService,
        private router: Router,
        private translate: TranslateService,
    ) { }
    private menuItemChangedSource = new Subject<any>();
    public menuItemChanged$ = this.menuItemChangedSource.asObservable();
    public menuCatClickedSource = new Subject<any>();
    public menuCatClicked$ = this.menuCatClickedSource.asObservable();
    private menuListChangedSource = new Subject<any>();
    public menuListChanged$ = this.menuListChangedSource.asObservable();
    public menuItems = {

    };

    setUpdatedOn(beach_id, updated_on) {
        let timestampObj = JSON.parse(localStorage.getItem('updated_on') || "{}");
        if (timestampObj[beach_id] && timestampObj[beach_id['updated_on']]) {
            return false;
        }
        timestampObj[beach_id] = updated_on;
        localStorage.setItem('updated_on', JSON.stringify(timestampObj));
        return true;
    }
    menuItemChanged(menuItem: any) {
        this.menuItemChangedSource.next(menuItem);
    }

    menuListChanged() {
        this.menuListChangedSource.next(this.menuItems);
    }
    menuListUpdated(list: any[]) {
        list.map((li: any) => {
            this.menuItems[li.id] = li;
        });
        this.menuListChanged();
    }

    addNewBeach(beach: any) {
        return this.appService.post('beach', beach)
            .then(res => res.success);
    }

    updateBeach(beach) {
        return this.appService.post('beach/update', beach)
            .then(res => {
                return res.success;
            })
            .then(newBeach => {
                this.appService.updateBeach(beach);
                return newBeach;
            });
    }

    async createBeachSettings(timezone, latitude, longitude) {
        const beach = await this.appService.getBeach();
        return this.appService.post('beach/setting', {
            timezone, latitude, longitude,
            beach_id: beach.id
        })
            .then(res => {
                return res.data;
            })
            .then(new_beach => {
                this.appService.updateBeach(new_beach);
                return beach;
            });
    }

    async updateBeachSettings(settings) {
        const beach = await this.appService.getBeach();
        return this.appService.post('beach/setting/update', {
            ...settings,
            beach_id: beach.id
        })
            .then(res => {
                return res.data;
            })
            .then((setting) => {
                this.appService.updateBeachSettings(setting);
                return settings;
            });
    }
    async getBeachGalleries() {
        const beach = await this.appService.getBeach();
        return await this.appService.get(`beach/gallery/${beach.id}`)
            .then(res => res.data.reverse());
    }

    async addGallery(file) {
        const beach = await this.appService.getBeach();
        const body = new FormData();
        body.append('beach_id', beach.id);
        body.append('image', file);
        return await this.appService.multipart('beach/gallery', body)
            .then(res => res.data);
    }

    async saveAgreement(info){
        const beach = await this.appService.getBeach();
        return this.appService.post('beach/save-agreement', {info,beach_id:beach.id})
        .then(res => {
            return res.success;
        })
    }

    async getAgreementList(){
        const beach = await this.appService.getBeach();
        return await this.appService.get(`beach/get-agreement/${beach.id}`)
        .then(res => res.data);

    }

    async doImageUpload(file, imgUrl = "", subFolder = "") {
        const beach = await this.appService.getBeach();
        const body = new FormData();
        body.append('beach_id', beach.id);
        if (imgUrl) {
            body.append('imgUrl', imgUrl);
        } if (subFolder) {
            body.append('subFolder', subFolder);
        }
        body.append('image', file);
        return await this.appService.multipart('beach/gallery/upload', body)
            .then(res => res.newName);
    }

    async removeUplads() {
        const beach = await this.appService.getBeach();
        const body = new FormData();
        body.append('beach_id', beach.id);
        return await this.appService.get('beach/gallery/delete-uploads/' + beach.id)
            .then(res => res.data);
    }

    async uploadImage(dataUrl, imgUrl = "", subFolder = "") {
        var byteString = atob(dataUrl.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var blob = new Blob([ia], { type: 'image/jpeg' });
        var file = new File([blob], "0.png");
        return this.doImageUpload(file, imgUrl, subFolder);
    }

    async updateGallery(galleryID, file) {
        const beach = await this.appService.getBeach();
        const body = new FormData();
        body.append('beach_id', beach.id);
        body.append('id', galleryID);
        body.append('image', file);
        return await this.appService.multipart('beach/gallery/update', body)
            .then(res => res.data);
    }
    removeGallery(galleryID) {
        return this.appService.get(`beach/gallery/delete/${galleryID}`)
            .then(res => res.data);
    }
    setMainGallery(galleryID) {
        return this.appService.get(`beach/gallery/setmain/${galleryID}`)
            .then(res => res.data);
    }

    private beach_menus: any = false;
    async getBeachMenus() {
        if (this.beach_menus) { return this.beach_menus; }
        const beach = await this.appService.getBeach();
        return this.appService.get(`beach/menu/${beach.id}`)
            .then(res => res.data);
    }

    async refreshBeachMenus() {
        this.beach_menus = false;
        const beach = await this.appService.getBeach();
        return this.appService.get(`beach/menu/${beach.id}`)
            .then(res => {
                this.beach_menus = res.data;
                return true;
            });
    }

    async getBeach() {
        return this.appService.getBeach();
    }


    async getUsersList(params) {
       // const beach = await this.appService.getBeach();
        try {
            const res = await this.appService.post('beach/get-users',params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async approveBeach(params:any) {
       
        try {
            const res = await this.appService.post('beach/approve-beach', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async getMenu(beach_id) {
        return this.appService.get(`beach/get-menu/${beach_id}`)
            .then(res => res);
    }

    async getBeaches(params){
        const beaches = await this.appService.post('beach/beaches',params)
            .then(res => res.data)
        return beaches;
    }

    async getBeachCount(){
        const count = await this.appService.get('beach/beaches-count')
            .then(res => res)
        return count;
    }

    async getRegisteredBeaches() {
        const newBeaches = await this.appService.get('beach/registered-beaches')
            .then(res => res.data)
        return newBeaches;
    }

    async updateBeachStatus(params: any){
        try {
            const res = await this.appService.post('beach/update-beach', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async updateUserStatus(params: any){
        try {
            const res = await this.appService.post('beach/update-userstatus', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    
    async updateBeachGridImages(list) {
        const beach = await this.appService.getBeach(),
            beach_id = beach.id;
        return this.appService.post(`beach/grid/updateImages/` + beach_id, {list})
            .then(res => res.data);
    }
    async addBeachMenu(lang) {
        const beach = await this.appService.getBeach();
        const beach_id = beach.id;
        return this.appService.post('beach/menu', { beach_id, lang })
            .then(res => res.data);
    }

    async updateBeachMenu(id, lang) {
        return this.appService.post('beach/menu/update', { id, lang })
            .then(res => res.data);
    }

    async deleteBeachMenu(id) {
        return this.appService.get(`beach/menu/delete/${id}`)
            .then(res => res.data);
    }

    async getMenuCategories(menu_id) {
        const beach = await this.appService.getBeach();
        return this.appService.get(`beach/menu/category/${menu_id}`)
            .then(res => res.data);
    }

    async addMenuCategory(menu_id, name) {
        const beach = await this.appService.getBeach();
        return this.appService.post('beach/menu/category', { menu_id, name })
            .then(res => res.data);
    }

    async updateMenuCategory(id, name) {
        const beach = await this.appService.getBeach();
        return this.appService.post('beach/menu/category/update', { id, name })
            .then(res => res.data);
    }
    async deleteMenuCategory(id) {
        return this.appService.get(`beach/menu/category/delete/${id}`)
            .then(res => res.data);
    }

    async getMenuItems(category_id) {
        return this.appService.get(`beach/menu/item/${category_id}`)
            .then(res => res.data);
    }

    async addMenuItem(menu_item, menu_category_id) {
        const beach = await this.appService.getBeach();
        const body = new FormData();
        body.append('beach_id', beach.id);
        if (menu_category_id !== undefined && menu_category_id !== null) {
            body.append('menu_category_id', menu_category_id);
        }
        if (menu_item.name !== undefined && menu_item.name !== null) {
            body.append('name', menu_item.name);
        }
        if (menu_item.price !== undefined && menu_item.price !== null) {
            body.append('price', menu_item.price);
        }
        if (menu_item.description !== undefined && menu_item.description !== null) {
            body.append('description', menu_item.description);
        }
        if (menu_item.toppings !== undefined && menu_item.toppings !== null) {
            body.append('toppings', JSON.stringify(menu_item.toppings));
        }
        if (menu_item.image !== undefined && menu_item.image !== null) {
            body.append('image', menu_item.image);
        }
        return this.appService.post('beach/menu/item', body)
            .then(res => res.data);
    }
    async removePhoto(menu_item_id) {
        const beach = await this.appService.getBeach();
        const body = {
            beach_id: beach.id,
            id: menu_item_id,
            image: 'empty'
        };
        return this.appService.post('beach/menu/item/update', body)
            .then(res => res.data);
    }
    async updateMenuItem(menu_item) {
        const beach = await this.appService.getBeach();
        const body = new FormData();
        body.append('beach_id', beach.id);
        body.append('id', menu_item.id);
        if (menu_item.name !== undefined && menu_item.name !== null) {
            body.append('name', menu_item.name);
        }
        if (menu_item.price !== undefined && menu_item.price !== null) {
            body.append('price', menu_item.price);
        }
        if (menu_item.description !== undefined && menu_item.description !== null) {
            body.append('description', menu_item.description);
        }
        if (menu_item.image !== undefined && menu_item.image !== null) {
            body.append('image', menu_item.image);
        }
        if (menu_item.status !== undefined && menu_item.status !== null) {
            body.append('status', menu_item.status);
        }

        return this.appService.post('beach/menu/item/update', body)
            .then(res => res.data);
    }

    async deleteMenuItem(id) {
        return this.appService.get(`beach/menu/item/delete/${id}`)
            .then(res => res.data);
    }
    async addToppingItem(menu_id, name, price) {
        return this.appService.post(`beach/menu/item/toppings`, { menu_id, name, price })
            .then(res => res.data);
    }
    async updateToppingItem(menu_id, index, name, price) {
        return this.appService.post(`beach/menu/item/toppings/update`, { menu_id, index, name, price })
            .then(res => res.data);
    }
    async deleteToppingItem(menu_id, index) {
        return this.appService.post(`beach/menu/item/toppings/delete`, { menu_id, index })
            .then(res => res.data);
    }
    async updateToppingList(params) {
        return this.appService.post(`beach/menu/item/toppings/update-list`, params)
            .then(res => res.data);
    }


    async getBeachGrid() {
        const beach = await this.appService.getBeach();
        return this.appService.get(`beach/grid/${beach.id}`)
            .then(res => res.data);
    }

    async getAdminBeachGrid(beach_id){

        return this.appService.get(`beach/grid/${beach_id}`)
            .then(res => res.data);

    }
    async createBeachGrid(grid, width, height) {
        const beach = await this.appService.getBeach();
        return this.appService.post(`beach/grid`, {
            beach_id: beach.id,
            width, height, grid,
        })
            .then(res => res.data);
    }
    async updateBeachGrid(id, grid, width, height) {
        return this.appService.post(`beach/grid/update`, { id, grid, width, height })
            .then(res => res);
    }

    async publishBeachGrid(id) {
        const beach = await this.appService.getBeach();
        return this.appService.get(`beach/grid/publish/${id}`)
            .then(res => res.data);
    }
    async checkPublishedGrid() {
        const beach = await this.appService.getBeach();
        return this.appService.get(`beach/grid/published/${beach.id}`)
            .then(res => res.data);
    }
    async changeSeatLabel(change_seats) {
        const beach = await this.appService.getBeach();
        return this.appService.post(`beach/grid/seats/change`, { beach_id: beach.id, change_seats })
            .then(res => res.data);
    }
    async suspendSeats(seats, start_date, end_date) {
        const beach = await this.appService.getBeach();
        return this.appService.post(`beach/grid/suspend`, { beach_id: beach.id, start_date, end_date, seats })
            .then(res => res.data);
    }
    async getSuspendedSeats(start_date, end_date) {
        const beach = await this.appService.getBeach();
        return this.appService.post(`beach/grid/suspended_seat`, { beach_id: beach.id, start_date, end_date })
            .then(res => res.data);
    }
    async getRatingAndReviewCount() {
        const beach = await this.appService.getBeach();
        return Promise.all([
            this.appService.get(`beach/rating/counts/${beach.id}`).then(res => res.data),
            this.appService.get(`beach/review/count/${beach.id}`).then(res => res.data)
        ]);
    }
    async getReviews(page) {
        const beach = await this.appService.getBeach();
        return this.appService.get(`beach/review/${beach.id}/${page}`)
            .then(res => res.data);
    }

    async getBeachEntity(id, entity) {
        return this.appService.get(`beach/${id}/${entity}`)
        .then(res => res.data);
    }

    CHECK = {
        PLAN: 2,
        BEACH_ABOUT: 3,
        BEACH_SCHEDULE: 4,
        OPTIONS: 5,
        EMPLOYEE: 6,
        BEACH_MAP: 7,
        BEACH_MENU: 8,
    };
    async checkLogic(check_num) {
        const account = this.appService.authInfo.account;
        if (!account) { return; }
        if (check_num >= this.CHECK.PLAN) {
            if (account.company_address === null || account.company_city === null || account.company_country === null || account.company_zipcode === null) {
                throw {
                    logicError: this.translate.get('CHECK_LOGIC.PLAN_PAGE'),
                    url: '/profile'
                };
            }
        }

        if (check_num >= this.CHECK.BEACH_ABOUT) {
            if (account.plan_id === null) {
                throw {
                    logicError: this.translate.get('CHECK_LOGIC.BEACH_ABOUT'),
                    url: '/plans'
                };
            }
        }

        let beach: any = false;
        if (check_num > this.CHECK.BEACH_ABOUT) {
            try {
                beach = await this.appService.getBeach();
            } catch (error) {
                throw {
                    logicError: this.translate.get('CHECK_LOGIC.NO_BEACH'),
                    url: '/settings/settings-about'
                };
            }
        }

        if (check_num >= this.CHECK.BEACH_SCHEDULE) {
            try {

                if (!beach.settings) {
                    throw {
                        message: 'CHECK_LOGIC.LOCATION'
                    };
                }
                if (!beach.features || beach.features.length === 0) {
                    throw {
                        message: 'CHECK_LOGIC.FACILITIES'
                    };
                }
                // if (beach.description === '' || beach.description === null) {
                //     throw {
                //         message: 'CHECK_LOGIC.DESCRIPTION'
                //     };
                // }
            } catch (error) {
                throw {
                    logicError: this.translate.get(error.message),
                    url: '/settings/settings-about'
                };
            }
        }
        if (check_num >= this.CHECK.OPTIONS) {
            try {
                if (beach.settings.working_dates.length === 0) {
                    throw {
                        message: 'CHECK_LOGIC.WORKING_DATES'
                    };
                }
                if (Object.keys(beach.settings.working_hours).length === 0) {
                    throw {
                        message: 'CHECK_LOGIC.WORKING_HOURS'
                    };
                }
                if (Object.keys(beach.settings.seats_price).length === 0) {
                    throw {
                        message: 'CHECK_LOGIC.PRICES'
                    };
                }
            } catch (error) {
                throw {
                    logicError: this.translate.get(error.message),
                    url: '/settings/beach-schedule'
                };
            }
        }
        if (check_num >= this.CHECK.EMPLOYEE) {
            try {
            } catch (error) {
                throw {
                    logicError: this.translate.get(error.message),
                    url: '/settings/beach-schedule'
                };
            }
        }
        if (check_num >= this.CHECK.BEACH_MAP) {
            try {
                const employees = await this.userService.getEmployees();
                let broker: any = false;
                employees.forEach(employee => {
                    if (employee.type_id === 5) {
                        broker = employee;
                    }
                });
                if (!broker) {
                    throw {
                        message: 'CHECK_LOGIC.NO_BROKER'
                    };
                }
            } catch (error) {
                throw {
                    logicError: this.translate.get(error.message),
                    url: '/employees'
                };
            }
        }
        if (check_num >= this.CHECK.BEACH_MENU) {
            try {
                const beach_grid = await this.getBeachGrid();
            } catch {
                throw {
                    logicError: this.translate.get('CHECK_LOGIC.BEACH_MENU'),
                    url: '/beach-map/edit'
                };
            }
            if (this.appService.authInfo.account.plan_id === 1) {
                throw {
                    logicError: this.translate.get('CHECK_LOGIC.POOR_PLAN'),
                    url: '/beach-map/edit'
                };
            }
        }
    }

    async saveStructure(combinations: any, structures: any) {
        const beach = await this.appService.getBeach();
        return this.appService.post(`beach/setting/save-structure`, {
            beach_id: beach.id,
            combinations: combinations,
            structures: structures
        })
            .then(res => res.data);
    }

    saveCategory(category: any) {
        const id = category.id;
        this.categoryList[id] = category;
    }
    readCategory(id) {
        return this.categoryList[id] || null;
    }
    getBeachMenuLangIndex() {
        const am: any = document.querySelector('.beach-menu-tab.active');

        if (am) {
            return am.dataset['id'];
        }
        return -1;
    }
    getMenuItemById(list, id = '', notify = false) {

        if (notify) {
        }
        if (notify) {
            const menuItem = this.menuItems;
            for (let i = 0; i < list.length; i++) {
                const li = list[i];
                menuItem[li['id']] = li;
            }
            this.menuItems = menuItem;
        }
        for (let i = 0; i < list.length; i++) {
            const li = list[i];
            if (notify) {
                this.menuItemChanged(li);
            }
            if (!id || li.id == id) {
                return li;
            }
        }
        return null;
    }
}
