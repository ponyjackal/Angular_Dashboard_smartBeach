import { Component } from '@angular/core';
import { AppService, AssetService, BeachService } from '../services';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

declare const $: any;

@Component({
    selector: 'beach-menu-view',
    templateUrl: 'beach-menu-view.component.html',
    styleUrls: ['./beach-menu.css'],
})

export class BeachMenuViewComponent {

    constructor(
        private appService: AppService,
        private assetService: AssetService,
        private beachService: BeachService,
        private translate: TranslateService,
        private router: Router,
    ) {
        this.translate.use(this.appService.getLang());
    }

    beach_menus: any = [];
    isLoading: any = true;

    filterText: string = '';
    filterStatus: string = 'all';

    notifyData: any = false;
    notify(data) {
        this.notifyData = data;
    }
    ngOnInit() {
        this.isLoading = true;
        this.beachService.checkLogic(this.beachService.CHECK.BEACH_MENU)
            .then(() => {
                return this.beachService.getBeachMenus();
            })
            .then(beach_menus => {
                this.beach_menus = beach_menus;
                this.isLoading = false;
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
}
