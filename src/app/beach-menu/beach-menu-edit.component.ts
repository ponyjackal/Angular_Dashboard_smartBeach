import { Component } from '@angular/core';
import { AppService, BeachService, AssetService } from '../services';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

declare const $: any;
declare const window: any;

@Component({
    selector: 'beach-menu-edit',
    templateUrl: 'beach-menu-edit.component.html',
    styleUrls: ['./beach-menu.css'],
})

export class BeachMenuEditComponent {

    filterText: string = '';
    filterStatus: string = 'all';

    constructor(
        private assetService: AssetService,
        private beachService: BeachService,
        private translate: TranslateService,
        private appService: AppService,
        private router: Router,
    ) {
        localStorage.removeItem("selectedCategoryId");
        this.translate.use(this.appService.getLang());
        const notifyTab = (data) => {
            if (data.type === 'new_menu') {
                this.beach_menus.push(data.data);
                this.updateTabState();
            } else if (data.type === 'remove_menu') {
                this.beach_menus.splice(this.beach_menus.length - 1, 1);
                this.updateTabState();
            } else {
                this.notifyData = data;
            }
        }
        window.notifyTab = notifyTab.bind(this);
    }
    addableThirdMenu = true;
    removeableSecondMenu = true;

    beach_menus: any = [];
    isloading: any = true;
    ngOnInit() {
        this.isloading = true;
        this.beachService.checkLogic(this.beachService.CHECK.BEACH_MENU)
            .then(() => {
                return this.beachService.getBeach();
            })
            .then(beach => {
                return this.beachService.getBeachMenus();
            })
            .then(beach_menus => {
                this.beach_menus = beach_menus;
                this.updateTabState();
                this.isloading = false;
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
            })
    }
    notifyData: any = false;
    notify(data) {
        this.notifyData = data;
    }
    onClickMenu(menu_id) {
        this.beachService.menuCatClickedSource.next(menu_id);
    }
    updateTabState() {
        if (window.notifyMenu) {
            switch (this.beach_menus.length) {
                case 1:
                    window.notifyMenu[1]({
                        removable: false,
                        editable: true,
                        haveBeach: false,
                    })
                    window.notifyMenu[2]({
                        editable: false,
                        removable: false,
                        haveBeach: false,
                    })
                    break;
                case 2:
                    window.notifyMenu[1]({
                        removable: true,
                        editable: true,
                        haveBeach: true,
                    })
                    window.notifyMenu[2]({
                        removable: false,
                        editable: true,
                        haveBeach: false,
                    })
                    break;
                case 3:
                    window.notifyMenu[1]({
                        removable: false,
                        editable: true,
                        haveBeach: true,
                    })
                    window.notifyMenu[2]({
                        removable: true,
                        editable: true,
                        haveBeach: true,
                    })
                    break;
            }
        }
    }

}
