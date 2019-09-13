import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../services';

declare const $: any;

//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    icontype: string;
    collapse?: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
    userType: string;
}
const adminRoutes = [
    {
        path: '/new-register',
        title: 'Clients',
        type: 'link',
        icontype: 'settings'
    },
{
    path: '/users',
    title: 'Users',
    type: 'link',
    icontype: 'people'
    // },{
},

{
    path: '/beaches',
    title: 'Beaches',
    type: 'link',
    icontype: 'dashboard'
},
];
const userRoutes = [{
    path: '/plans',
    title: 'SIDE_MENU.PLAN',
    type: 'link',
    icontype: 'map',
}, {
    path: '/settings',
    title: 'SIDE_MENU.SETTINGS',
    type: 'sub',
    icontype: 'settings',
    collapse: 'settings',
    children: [
        { path: 'settings-about', title: 'SIDE_MENU.SETTINGS_ABOUT', ab: ' ' },
        { path: 'beach-schedule', title: 'SIDE_MENU.BEACH_SCHEDULE', ab: ' ' },
        { path: 'checkboxes', title: 'SIDE_MENU.OPTIONS', ab: ' ' }
    ]
},

{
    path: '/employees',
    title: 'SIDE_MENU.EMPLOYEES',
    type: 'link',
    icontype: 'dashboard'
}, {
    //     path: '/beach-map',
    //     title: 'SIDE_MENU.BEACH_MAP',
    //     type: 'link',
    //     icontype: 'map',
    // }, {
    path: '/beach-map',
    title: 'Beach map',
    type: 'sub',
    icontype: 'map',
    collapse: 'beach-map',
    children: [
        { path: 'view', title: 'View', ab: ' ' },
        { path: 'edit', title: 'Edit', ab: ' ' },
    ]
}, {
    path: '/beach-menu',
    title: 'SIDE_MENU.BEACH_MENU',
    type: 'sub',
    icontype: 'content_paste',
    collapse: 'beach-menu',
    children: [
        { path: 'view', title: 'SIDE_MENU.MENU_VIEW', ab: ' ' },
        { path: 'add-edit-delete', title: 'SIDE_MENU.MENU_EDIT', ab: ' ' }
    ]
},
{
    path: '/user',
    title: 'Users',
    type: 'link',
    icontype: 'people'
    // },{
},

{
    path: '/statistics',
    title: 'SIDE_MENU.STATISTICS.MAIN',
    type: 'sub',
    icontype: 'insert_chart',
    collapse: 'statistics',
    children: [
        { path: 'compare', title: 'SIDE_MENU.STATISTICS.COMPARE', ab: '  ' },
        { path: 'beach-status', title: 'SIDE_MENU.STATISTICS.BEACH_STATUS', ab: ' ' },
        { path: 'customers', title: 'SIDE_MENU.STATISTICS.CUSTOMERS', ab: ' ' },
        { path: 'rating-and-reviews', title: 'SIDE_MENU.STATISTICS.RATING', ab: ' ' }
    ]
}, {
    path: '/suport-center',
    title: 'Suport center',
    type: 'link',
    icontype: 'date_range'
    // },{
}
];

const user = JSON.parse(localStorage.getItem('currentUser'));
if(user){
    this.userType = user.account.client_type;
}
//Menu Items
export const ROUTES: RouteInfo[] = (this.userType == 'superadmin') ? adminRoutes : userRoutes;
@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    client_type : any;
    beach: any = {};
    constructor(
        private translate: TranslateService,
        private appService: AppService,
    ) {
        this.client_type = JSON.parse(localStorage.getItem('currentUser')).account.client_type;
        this.translate.use(this.appService.getLang());
        if(this.client_type != 'superadmin'){
            this.appService.getBeach()
            .then(beach => {
                
                this.beach = beach;
            })
            .catch(error => { });
    }
        }
        
    showMenu = false;

    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        $(document).on('click', '.nav-side', function (e) {
            e.stopPropagation();
            $('.sidebar').addClass('opened');
        });
        $(document).on('click', '.overlay,.sidebar.opened a[ng-reflect-router-link]', function (e) {
            $('.sidebar').removeClass('opened');
        });
    }
    updatePS(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            let ps = new PerfectScrollbar(elemSidebar, { wheelSpeed: 2, suppressScrollX: true });
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }
}
