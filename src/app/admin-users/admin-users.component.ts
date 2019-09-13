// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AssetService,BeachService } from '../services/index';
declare const swal: any;
declare const $: any;

@Component({
    selector: 'admin-user-cmp',
    templateUrl: 'admin-users.component.html',
    styleUrls: ["./admin-users.component.scss"]
})

export class AdminUsersComponent implements OnInit {
    supportData:any={};
    blockStatus = 'BLOCK';
    loading = false;
    blocked = false;
    showStatus = false;

    constructor(
        private assetService: AssetService,
        private beachService: BeachService,
    ){
        // this.beachService.getBeachList()
        // .then(beach => {
          
        // })
        // .catch(error => {
        //   if (error.type === 'auth') {
        //     return;
        //   }
  
        //   swal({
        //     type: 'error',
        //     title: '',
        //     confirmButtonClass: 'btn btn-info',
        //     text: error.message,
        //     buttonsStyling: false,
        //   }).catch(swal.noop);
        // });
    }

    ngOnInit() {
       
    }
}
