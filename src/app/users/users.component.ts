// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AssetService,BeachService } from '../services/index';
declare const swal: any;
declare const $: any;

@Component({
    selector: 'app-user-cmp',
    templateUrl: 'users.component.html',
    styleUrls: ["./users.component.scss"]
})

export class UsersComponent implements OnInit {
    supportData:any={};
    userList:any =[];
    users:any=[];
    bookings:any=[];
    blockUser:any=[];
    blockClick = false;
    blocked:any;
    validated:any;
    status:any ='all';
    allCount:any;
    nonValidCount:any;
    blockCount:any;
    start = 0;
    limit = 50;
    loading = false;
    
    public filterText: any = '' ;

    constructor(
        private assetService: AssetService,
        private beachService: BeachService,
    ){
      this.getUsers();
        
    }

    ngOnInit() {
       
    }

    getTotal(status){
      let count =0 ;
        if(status == 'validated'){
      for(let i=0;i<this.users.length;i++){
          if(!this.users[i].validated){
              count++;
          }
        //  this.beach_count = count;
  }
      return count;
}
else{
  for(let i=0;i<this.users.length;i++){
    if(this.users[i].blocked){
        count++;
    }
  //  this.beach_count = count;
}
return count;

}
  }

  getUsers(){
    this.loading = true;
    const params = {
      start: this.start,
      limit: this.limit,
      status:this.status,
  };
    this.beachService.getUsersList(params)
    .then(user => {
    //  this.users = user.data;
      this.loading = false;
        this.allCount = user.allCount;
        this.nonValidCount = user.noValidCount;
        this.blockCount = user.blockCount;
      for (let i = 0; i < user.data.length; i++) {
        this.users.push(user.data[i]);
    }
    })
    .catch(error => {
      if (error.type === 'auth') {
        return;
      }

      swal({
        type: 'error',
        title: '',
        confirmButtonClass: 'btn btn-info',
        text: error.message,
        buttonsStyling: false,
      }).catch(swal.noop);
    });
  }

  validate(user){
    if(this.status == 'all'){
      return true;
    }
    else if(this.status == 'validated'){
      if(!user.validated){
        return true;
      }
      else{
        return false;
      }

    }
    else if(this.status == 'blocked'){
      if(user.blocked){
        return true;
      }
      else{
        return false;
      }

    }

  }

  getNoValidUsers(){
    this.start = 0;
    this.limit = 50;
    this.users = [];
    this.getUsers();
  }

  getBlockUsers(){
    this.start = 0;
    this.limit = 50;
    this.users = [];
    this.getUsers();
  }


  changeStatus(user){
    let params={
      user:user
  }
    this.beachService.updateUserStatus(params)
        .then(res => {
        this.start = 0;
        this.limit = 50;
        this.users = [];
        this.getUsers();
  
})

  }

  onScroll(){
    this.start += 50;
    this.getUsers();

  }
  
  usersCount(){

  }

}
