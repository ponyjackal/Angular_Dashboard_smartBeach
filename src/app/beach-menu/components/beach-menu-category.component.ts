import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BeachService, AppService } from '../../services';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;

@Component({
    selector: 'beach-menu-category',
    templateUrl: 'beach-menu-category.component.html'
})

export class BeachMenuCategory {

    @Input() filterText: string = '';
    @Input() filterStatus: string = 'all';
    @Input() menu_category;
    @Input() editable;
    @Input() notifyData;
    @Output() notify: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();


    menu_index = -1;
    constructor(
        private beachService: BeachService,
    ) {
        this.beachService.menuListChanged$.subscribe((menuItems: any) => {

            const that = this;
            setTimeout(() => {
                const menuIndex = {
                };
                const list = this.menu_items;
                for (let i = 0; i < list.length; i++) {
                    const li = list[i];
                    if (!li.id) {
                        list.splice(i, 1);
                    }
                }


                for (let i = 0; i < list.length; i++) {
                    const li = list[i];
                    menuIndex[li.id] = li;
                }
                let keys = Object.keys(menuItems);
                for (let i = 0; i < keys.length; i++) {
                    const menu_id = keys[i],
                        li = menuItems[menu_id];
                    if (li.menu_category_id == that.menu_category.id) {
                        if (!menuIndex[menu_id]) {
                            that.addingMenuItem = false;
                            that.menu_items.push(li);
                        }
                    }
                }
            }, 400);
        });
    }
    selectCat(cat) {
        localStorage.setItem('selectedCategoryId', cat.cat_index);
        setTimeout(() => {
            let id = cat.id;
            let ind = cat.cat_index;
            let item = $("#" + id + "-id a"),
                col = $("#" + id + ".collapse.in").length;
            if (!col) {
                localStorage.removeItem('selectedCategoryId');
            }
        }, 1000);


        this.onClick.emit(cat.cat_index);
    }
    editingCategory = false;
    updateCategory() {
        this.beachService.updateMenuCategory(this.menu_category.id, this.menu_category.name)
            .then(category => {
                this.editingCategory = false;
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
    removeCategory() {
        if (!confirm("Are you sure you want to delete this category?")) return;
        this.beachService.deleteMenuCategory(this.menu_category.id)
            .then(() => {
                this.notify.emit({
                    type: 'remove_category',
                    data: this.menu_category,
                });
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

    notifyItem(data) {
        data.category_index = this.menu_category.index;
        if (data.type === 'cancel_item') {
            this.addingMenuItem = false;
        } else {
            this.notify.emit(data);
        }
    }

    addingMenuItem = false;

    menu_items: any = [];

    ngOnInit() {
        this.menu_index = this.menu_category.index;
        if (this.menu_category) {
            this.beachService.getMenuItems(this.menu_category.id)
                .then(menu_items => {
                    this.menu_items = menu_items;
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
    ngOnChanges() {
        if (this.notifyData) {
            if (this.menu_category.index !== this.notifyData.category_index) return;
            switch (this.notifyData.type) {
                case "remove_item":
                    if (this.notifyData.data.id) {
                        this.menu_items.forEach((element, index) => {
                            if (element.index === this.notifyData.data.index) {
                                this.menu_items.splice(index, 1);
                                swal({
                                    type: 'success',
                                    title: '',
                                    confirmButtonClass: 'btn btn-info',
                                    text: 'Product has been deleted',
                                    buttonsStyling: false,
                                }).catch(swal.noop);
                            }
                        });
                    }
                    break;
                case "new_item":
                    const menu_items = this.notifyData.data;
                    menu_items.forEach(item => {
                        if (item.menu_category_id === this.menu_category.id && item.menu_id === this.menu_category.menu_id) {
                            this.menu_items.push(item);
                            this.addingMenuItem = false;
                        }
                    })
                    break;
            }
        }
        if (this.filterText || this.filterStatus !== 'all') {
            $('a.collapsed .material-icons').addClass('search_result')
            $('a.collapsed .material-icons').trigger('click');
        } else {
            $('a[aria-expanded=true] .material-icons.search_result').trigger('click');
            $('.search_result').removeClass('search_result');
        }
    }
}
