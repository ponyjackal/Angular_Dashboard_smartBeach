// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AssetService,BeachService } from '../services/index';
declare const swal: any;
declare const $: any;

@Component({
    selector: 'app-new-register-cmp',
    templateUrl: 'new-register.component.html',
    styleUrls: ["./new-register.component.scss"]
})

export class NewRegisterComponent implements OnInit {
    supportData:any={};
    blockStatus = 'BLOCK';
    userList:any =[];
    beaches:any=[];
    bookings:any=[];
    beach_count:any;
    status:any = 'all';
    public filterText: any = '' ;

    constructor(
        private assetService: AssetService,
        private beachService: BeachService,
    ){
     
    }

    ngOnInit() {
        this.getNewBeaches();
    }

    getNewBeaches(){
        
        this.beachService.getRegisteredBeaches()
        .then(beaches => {
            this.beaches = beaches;
      })
    }
    getTotal(status){
        let count =0 ;
          
        for(let i=0;i<this.beaches.length;i++){
            let beach_status =  this.beaches[i]['status'];
            if(status == beach_status){
                count++;
            }
          //  this.beach_count = count;
    }
        return count;
    }

    onClickApprove(beachid,changestatus,email){
        let params = {
            id:beachid,
            status:changestatus,
            email:email
        };
        this.beachService.approveBeach(params)
        .then((res) => {
            this.getNewBeaches();
        })
        .catch(error => {
            if (error.type === 'auth') return;
            swal({
                type: 'error',
                title: '',
                confirmButtonClass: 'btn btn-info',
                text: error.message,
                buttonsStyling: false,
            }).catch(swal.noop);
        })
    }

}
