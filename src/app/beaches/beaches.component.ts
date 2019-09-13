// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AssetService, BeachService, AppService, UserService } from '../services/index';

declare const swal: any;
declare const $: any;

@Component({
    selector: 'app-beaches-cmp',
    templateUrl: 'beaches.component.html',
    styleUrls: ["./beaches.component.scss"]
})

export class BeachesComponent implements OnInit {

    beachFacilities: any;
    facilities: any = {};
    beaches: any = [];
    status: any = 'all';
    filterStatus = 'all';
    filterProduct: any = '';
    menu_index = 0;
    showStatus = false;
    start = 0;
    limit = 20;
    allCount: any;
    pendingCount: any;
    publishCount: any;
    reqPubCount: any;
    suspendedCount: any;
    loading = false;
    newToppingItem = {
        name: '',
        price: '',
        edit: false,
        editName: '',
        editPrice: ''
    };
    statusObj = {
        'suspended': '#836f8b',
        'published': '#9c27b0',
        'pending-approval': '#f44336',
        'pending': 'rgb(196,201,140)',
        'inactive': 'grey',

    };
    statusList = [{
        title: 'SUSPENDED',
        name: 'suspended',
        color: '#836f8b'
    }, {
        title: 'PUBLISHED',
        name: 'published',
        color: '#9c27b0'
    },
    {
        title: 'REQUEST PUBLISH',
        name: 'pending-approval',
        color: '#f44336'
    }, {
        title: 'PENDING',
        name: 'inactive',
        color: 'rgb(196,201,140)'
    }];
    public filterText: any = '';

    constructor(
        private assetService: AssetService,
        private beachService: BeachService,
        private translate: TranslateService,
        private appService: AppService,
        private userService: UserService
    ) {
        this.translate.use(this.appService.getLang());
    }

    ngOnInit() {
        this.getBeachFacilities();
        this.getBeaches();
        this.getBeachCount();
    }

    getBeachFacilities() {
        this.assetService.getBeachFacilities()
            .then(beachFacilities => {
                this.beachFacilities = beachFacilities;

            })
    }

    getBeaches() {
        this.loading = true;
        const params = {
            start: this.start,
            limit: this.limit,
            status: this.status,
            filter: this.filterText
        };
        this.beachService.getBeaches(params)
            .then(beaches => {
                // this.beaches = beaches;
                this.loading = false;
                for (let i = 0; i < beaches.length; i++) {
                    this.beaches.push(beaches[i]);
                }
            })
    }

    getBeachCount() {
        this.beachService.getBeachCount()
            .then(data => {
                this.allCount = data.allCount
                this.pendingCount = data.pendingCount
                this.publishCount = data.publishCount
                this.reqPubCount = data.reqPubCount
                this.suspendedCount = data.suspendedCount

            })
    }

    getTotal(status) {
        let count = 0;

        for (let i = 0; i < this.beaches.length; i++) {
            let beach_status = this.beaches[i]['status'];
            if (status == beach_status) {
                count++;
            }
            //  this.beach_count = count;
        }
        return count;
    }

    getFacilityIconClass(id: number, state): string {
        const idStr = ("0" + id).slice(-2);
        return `facilityIconClass beach_facilities_${idStr}_${state}_icon`;
    }
    saveStatus(data) {
        let params = {
            beach: data
        }
        this.beachService.updateBeachStatus(params)
            .then(res => {
                this.getBeachCount();
                this.start = 0;
                this.limit = 50;
                this.beaches = [];
                this.getBeaches();
                data._changed = false;

            })
    }
    getProducts(beach, category) {
        category.products = beach.products.filter((pro) => {
            return (pro.menu_category_id == category.id);
        });
    }
    getMenu(beach) {
        if(beach.see_menu){
            this.beachService.getMenu(beach.beach_id)
            .then(res => {
                beach.menu = res.menu_list || [];
                beach.products = res.product_list;
            }).catch((err) => {
                
            });
        }
    
    }

    onClickFilter(status) {
        
        
        if (this.filterProduct || status !== 'all') {
            $('a.collapsed .material-icons').addClass('search_result')
            $('a.collapsed .material-icons').trigger('click');
        } else {
            $('a[aria-expanded=true] .material-icons.search_result').trigger('click');
            $('.search_result').removeClass('search_result');
        }
    }

    get(category) {
        
    }

    onScroll() {
        this.start += 20;
        this.getBeaches();

    }

    beachFilter() {
        this.start = 0;
        this.limit = 50;
        this.beaches = [];
        this.getBeaches();

    }

    filterBeach(text){
        this.start = 0;
        this.limit = 50;
        this.filterText = text;
        this.beaches = [];
        this.getBeaches();

    }

    /**
     * Connect to the beach
     * @param beach 
     */
    onConnect(beach) {
        let user = JSON.parse(localStorage.getItem('currentUser'));
        user.account.client_type = 'super-admin-beach-panel';
        localStorage.setItem('currentUser', JSON.stringify(user));
        // set the beach
        this.userService.getClientById(beach.client_id).then( res=> {
            this.appService.setAutoInfo(res);
            // redirect to admin panel
            window.location.href='/profile';
        });
    }
}
