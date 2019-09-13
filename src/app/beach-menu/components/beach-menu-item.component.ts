import { Component, Input, EventEmitter, Output, OnChanges, OnInit } from '@angular/core';
import { BeachService, AppService } from '../../services';
import swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItemEditComponent } from './item-edit.component';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
declare const $: any;
declare const windows: any;

@Component({
  selector: 'beach-menu-item',
  templateUrl: 'beach-menu-item.component.html',
  styleUrls: ['beach-menu-item.component.css']
})

export class BeachMenuItem implements OnChanges, OnInit {

  @Input() filterText = '';
  @Input() filterStatus = 'all';
  @Input() menu_item;
  @Input() editable;
  @Input() menu_category_id;
  @Input() notifyData;
  @Input() set menu_index(val: any) {
    this.menuIndex = val;
  };
  @Output() notify: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private beachService: BeachService, public dialog: MatDialog
  ) {
    this.beachService.menuItemChanged$.subscribe((menuItem: any) => {


      if (this.menu_item.id == menuItem.id) {

        this.menu_item.toppings = menuItem.toppings;
        this.menu_item.toppings_copy = [].concat(menuItem.toppings || []);
        this.checkToppingsRow();
        this.menu_item.price = menuItem.price;
        this.menu_item.image = menuItem.image;
        this.changeDetectorRef.markForCheck();
      } else if (this.beachService.menuItems[this.menu_item.id]) {
        menuItem = this.beachService.menuItems[this.menu_item.id];
        this.menu_item.toppings = menuItem.toppings;
        this.menu_item.toppings_copy = [].concat(menuItem.toppings || []);
        this.checkToppingsRow();
        this.menu_item.price = menuItem.price;
        this.menu_item.image = menuItem.image;
        this.changeDetectorRef.markForCheck();

      } else if (menuItem.id == "b9c86bcb-b153-4bc2-98f8-4d40bc78c8e1") {

      }
    });
  }
  menuIndex = -1;
  newToppingItem: any = {
    name: '',
    price: '',
    edit: false,
    editName: '',
    editPrice: ''
  };

  toppingsRemovedList = [];
  private currency = 'Euro';
  dataChanged = false;
  saving = false;
  toppingsActivity = [];
  toppingsActivityAdd(type, index) {
    this.toppingsActivity.push({
      type, index
    });
  }
  toppingsActivityClear() {
    this.toppingsActivity = [];
  }
  ngOnInit() {
    this.beachService.getBeach()
      .then(beach => {
        this.currency = beach.settings.currency;
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
    if (!this.menu_item) {
      this.menu_item = {};
    }
    if (!this.menu_item.toppings) {
      this.menu_item.toppings = [];
    }
    this.menu_item.toppings_copy = this.menu_item.toppings || [];
    this.checkToppingsRow();
  }
  matched = true;

  dataChanges() {
    this.dataChanged = true;
  }
  checkToppingsRow() {
    let rows = this.menu_item.toppings_copy || [];
    const doInsert = function () {
      this.menu_item.toppings_copy.push({
        name: '',
        price: ''
      });
      this.toppingsActivityAdd('add', this.menu_item.toppings_copy.length - 1);
    }.bind(this);
    if (rows.length) {
      let lastRow = rows[rows.length - 1];
      if (lastRow && lastRow.name && lastRow.price) {
        doInsert();
      }
    } else {
      doInsert();
    }
  }
  ngOnChanges() {
    if (this.notifyData) {
      if (this.notifyData.type === 'update_item') {
        const updated_menuitems = this.notifyData.data;
        updated_menuitems.forEach(item => {
          if (this.menu_item.id === item.id) {
            this.menu_item = item;
            this.menu_item.toppings_copy = this.menu_item.toppings || [];
            this.checkToppingsRow();
          }
        });
      }
    }
    if (!this.menu_item) {
      return;
    }
    let matched = false;
    if (this.filterStatus === 'all') {
      matched = true;
    } else if (this.filterStatus === this.menu_item.status) {
      matched = true;
    }
    if (matched && this.filterText && this.menu_item.name !== undefined) {
      matched = false;
      if (this.menu_item.name.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1) {
        matched = true;
      } else {
        for (const item of this.menu_item.toppings) {
          if (item.name.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1) {
            matched = true; break;
          }
        }
      }
    }
    this.matched = matched;
  }

  removePhoto() {
    this.dataChanges();
    if (this.menu_item.id) {
      this.beachService.removePhoto(this.menu_item.id);
    }
  }

  editToppingItem(index) {
    const item = this.menu_item.toppings_copy[index];
    item.editName = item.name,
      item.editPrice = item.price;
    item.edit = true;
  }

  updateToppingItem(index) {
    const item = this.menu_item.toppings_copy[index];
    if (!item.editPrice || !item.editName) {
      swal({
        type: 'error',
        title: '',
        confirmButtonClass: 'btn btn-info',
        text: 'Plesae fill the details',
        buttonsStyling: false,
      });
      return;
    }
    item.name = item.editName,
      item.price = item.editPrice,
      item.edit = false;
    this.dataChanges();
  }

  onToppingContentChanged(index) {
    this.checkToppingsRow();
    this.dataChanged = true;
  }

  deleteToppingItem(index) {
    const item = this.menu_item.toppings_copy[index];
    if (item.edit) {
      item.edit = false;
      return;
    }
    this.menu_item.toppings_copy.splice(index, 1);
    this.toppingsActivityAdd('delete', index);
    this.checkToppingsRow();
    this.dataChanges();
    return;
    if (this.menu_item.id) {
      this.beachService.deleteToppingItem(this.menu_item.id, index)
        .then(updated_items => {
          this.notify.emit({
            type: 'update_item',
            data: updated_items,
          });
          //  this.newToppingItem = {};
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
    } else {

      // this.newToppingItem = {};
    }
  }

  saveMenuItem() {
    const item = this.menu_item,
      menuItem: any = {
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        toppings: []
      };

    item.toppings_copy.map((topping: any) => {
      if (topping && topping.name && topping.price) {
        menuItem.toppings.push({
          name: topping.name,
          price: topping.price
        });
      }
    });

    if (item.id) {
      // Edit item
      menuItem.id = item.id;
      this.saving = true;
      this.beachService.updateMenuItem(menuItem).then((res: any) => {
        const params = {
          menu_id: item.id,
          index: 0,
          toppings: menuItem.toppings,
          toppingsHistory: this.toppingsActivity
        }
        this.beachService.updateToppingList(params).then((res: any) => {
          this.menu_item.toppings = menuItem.toppings;
          this.menu_item.toppings_copy = menuItem.toppings;
          this.checkToppingsRow();
          let rec = this.beachService.getMenuItemById(res, item.id, true);
          this.dataChanged = false;
          this.toppingsActivityClear();
          this.saving = false;
          this.beachService.menuListChanged();
          swal({
            type: 'success',
            title: '',
            confirmButtonClass: 'btn btn-info',
            text: 'Product has been saved',
            buttonsStyling: false,
          }).catch(swal.noop);
        }).catch((error: any) => {
          this.dataChanged = false;
          this.saving = false;
          this.beachService.menuListChanged();
          swal({
            type: 'error',
            title: '',
            confirmButtonClass: 'btn btn-info',
            text: error.message,
            buttonsStyling: false,
          }).catch(swal.noop);
        });
        let rec = this.beachService.getMenuItemById(res, item.id);
        if (rec) {
          let keys = Object.keys(rec);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.menu_item[key] = rec[key];
          }

          // this.menu_item.toppings_copy = this.menu_item.toppings || [];
          this.checkToppingsRow();

        }
      }).catch((err: any) => {
        this.beachService.menuListChanged();
        this.saving = false;
      });
    } else {

      this.saving = true;
      this.beachService.addMenuItem(menuItem, this.menu_category_id).then((res: any) => {
        let index = this.beachService.getBeachMenuLangIndex();
        if (res && res.length && res[index]) {
          this.menu_item = res[index];
          this.menu_item.toppings_copy = this.menu_item.toppings || [];
          this.checkToppingsRow();
        }
        this.dataChanged = false;
        this.saving = false;
        this.beachService.menuListUpdated(res);
        swal({
          type: 'success',
          title: '',
          confirmButtonClass: 'btn btn-info',
          text: 'Product has been saved',
          buttonsStyling: false,
        }).catch(swal.noop);
      }).catch((error: any) => {
        this.dataChanged = false;
        this.saving = false;
        this.beachService.menuListUpdated([]);
        swal({
          type: 'error',
          title: '',
          confirmButtonClass: 'btn btn-info',
          text: error.message,
          buttonsStyling: false,
        }).catch(swal.noop);
      });
      // Add item
    }

  }
  addNewTopping() {

    const item = this.newToppingItem;
    if (!item.name || !item.price) {
      swal({
        type: 'error',
        title: '',
        confirmButtonClass: 'btn btn-info',
        text: 'Plesae fill the details',
        buttonsStyling: false,
      });
      return;
    }
    if (!this.menu_item.toppings_copy) {
      this.menu_item.toppings_copy = [];
      this.checkToppingsRow();
    }
    this.menu_item.toppings_copy.push(item);
    this.newToppingItem = {
      name: '',
      price: '',
      edit: false,
      editName: '',
      editPrice: ''
    };
    this.checkToppingsRow();
    return;
    if (this.menu_item.id) {
      this.beachService.addToppingItem(this.menu_item.id, this.newToppingItem.name, this.newToppingItem.price)
        .then(updated_items => {
          this.notify.emit({
            type: 'update_item',
            data: updated_items,
          });
          this.newToppingItem = {};
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
    } else {
      this.menu_item.toppings.push(this.newToppingItem);
      this.newToppingItem = {};
    }
  }
  editMenuItem() {
    const dialogRef = this.dialog.open(ItemEditComponent, {
      maxWidth: '80vw',
      width: '800px',
      data: this.menu_item
    });

    dialogRef.afterClosed().subscribe(menu_item => {
      if (menu_item) {

        this.menu_item = menu_item;
        this.menu_item.toppings_copy = this.menu_item.toppings || [];
        this.checkToppingsRow();

      }
    });
  }

  changeImage($event) {
    this.menu_item.image = $event.target.files[0];
  //  setTimeout(()=>{
  //   this.changeDetectorRef.markForCheck();
  //  },100);

  }
  publishMenuItem() {
    this.beachService.updateMenuItem({
      id: this.menu_item.id,
      status: 'active',
    })
      .then(updated_items => {
        this.notify.emit({
          type: 'update_item',
          data: updated_items,
        });
      });
  }
  suspendMenuItem() {
    this.beachService.updateMenuItem({
      id: this.menu_item.id,
      status: 'inactive',
    })
      .then(updated_items => {
        this.notify.emit({
          type: 'update_item',
          data: updated_items,
        });
      });
  }
  removeMenuItem() {
    if (this.menu_item.id) {
      swal({
        title: '<strong>Delete product</strong>',
        type: 'info',
        html:
          'Are you sure you want to delete this product?',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:
          'Confirm delete',
        confirmButtonAriaLabel: 'Yes Delete now',
        cancelButtonText:
          'Cancel',
        cancelButtonAriaLabel: 'Cancel',
      }).then((result) => {
        this.beachService.deleteMenuItem(this.menu_item.id)
          .then(() => {
            this.notify.emit({
              type: 'remove_item',
              data: this.menu_item,
            });
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
      });
      return;
      if (!confirm('Are you sure you want to delete this product?')) {
        return;
      }

    } else {

      this.notify.emit({
        type: 'cancel_item',
        data: this.menu_item,
      });
    }
  }
}
