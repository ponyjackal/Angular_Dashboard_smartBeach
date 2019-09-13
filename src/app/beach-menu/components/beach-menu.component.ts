import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppService, BeachService } from '../../services';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;

@Component({
    selector: 'beach-menu',
    templateUrl: 'beach-menu.component.html',
})

export class BeachMenu {

    constructor(
        private beachService: BeachService,
        private translate: TranslateService,
    ) {
        this.beachService.menuCatClicked$.subscribe((menu_id) => {
            if (this.menuIndex == menu_id) {
                this.openDefaultCatView();
            } else {
            }
        });
    }
    @Input() filterText: string = '';
    @Input() filterStatus: string = 'all';
    @Input() beach_menu: any
    @Input() editable: boolean
    @Input() notifyData: any;
    @Input() set menu_index(val: any) {

        this.menuIndex = val;
    };
    menuIndex = '';
    @Output() notify: EventEmitter<any> = new EventEmitter<any>();

    menu_categories: any = [];

    notifyCategory(data) {

        this.notify.emit(data);
    }
    ngOnInit() {
        this.init();
    }
    private loaded: any = false;
    init() {
        if (this.beach_menu) {
            this.beachService.getMenuCategories(this.beach_menu.id)
                .then(menu_categories => {
                    this.menu_categories = menu_categories;
                    let i = 0;
                    menu_categories.map((cat: any) => {
                        cat.cat_index = i++;
                        this.beachService.saveCategory(cat);
                    });
                    this.loaded = true;
                    this.openDefaultCatView();
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
    openDefaultCatView() {
        setTimeout(() => {
            this.setDefaultCatView();
        }, 200);
    }
    setDefaultCatView() {
        let sCat = localStorage.getItem("selectedCategoryId");
        if (!sCat) {
            sCat = "-1";
        }
        let cats = this.menu_categories;
        let i = 1;
        cats.map((cat) => {
            let id = cat.id;
            let ind = cat.cat_index;
            let item = $("#" + id + "-id a"),
                col = $("#" + id + ".collapse.in").length;
            if (ind == sCat) {
                if (!col) {
                    item.click();
                }

            } else {
                if (col) {
                    item.click();
                }

            }
        })

    }
    onClickCategory($event) {
        let cats = this.menu_categories;
        let i = 1;
        cats.map((cat) => {
            let id = cat.id,
                ind = cat.cat_index;
            let item = $("#" + id + "-id a"),
                col = $("#" + id + ".collapse.in").length;
            if (ind !== $event) {
                if (col) {
                    item.click();
                }
            } else {

            }
        })
    }
    ngOnChanges() {
        if (!this.loaded) this.init()
        if (this.notifyData) {
            if (!this.beach_menu || !this.beach_menu.id) return;
            if (this.notifyData.type === "new_category") {
                const categories = this.notifyData.data;
                categories.forEach(item => {
                    if (item.menu_id === this.beach_menu.id) {
                        this.menu_categories.push(item);
                    }
                })
            } else if (this.notifyData.type === "remove_category") {
                const category = this.notifyData.data;
                this.menu_categories.forEach((item, index) => {
                    if (item.index === category.index) {
                        this.menu_categories.splice(index, 1);
                    }
                })
            }
        }
    }

    private addingCategory = false;
    private newCategory = "";
    addNewCategory() {
        this.beachService.addMenuCategory(this.beach_menu.id, this.newCategory)
            .then(menu_categories => {
                this.beachService.refreshBeachMenus();
                this.notify.emit({
                    type: "new_category",
                    data: menu_categories,
                })
                this.addingCategory = false;
            })
            .then(() => this.beachService.getMenuCategories(this.beach_menu.id))
            .then(menu_categories => { })
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
