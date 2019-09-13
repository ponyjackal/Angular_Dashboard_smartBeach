import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppService, BeachService, AssetService } from '../../services';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;
declare const window: any;

@Component({
    selector: '[beach-menu-tab]',
    styleUrls: ['beach-menu-tab.component.css'],
    templateUrl: 'beach-menu-tab.component.html'
})

export class BeachMenuTab {

    private beach_menu: any = false
    @Input() empty_title: string = "english"
    @Input() editable: boolean = false
    @Input() tab_id: string
    @Input() menu_index: string
    @Input() ismain: string

    editing: boolean = false
    removable: boolean = true

    private tab_title: any = "Unknown"

    constructor(
        private beachService: BeachService,
        private assetService: AssetService,
    ) {
    }

    notifyMenu(data) {
        if (data.removable !== undefined) {
            this.removable = data.removable;
        }
        if (data.editable !== undefined) {
            this.editable = data.editable;
        }

        if (data.haveBeach && !this.beach_menu) {
            this.init();
        } else if (!data.haveBeach && this.beach_menu) {
            this.beach_menu = false;
        }
    }

    save() {
        var promise: any = false;
        if (this.beach_menu) {
            this.beachService.updateBeachMenu(this.beach_menu.id, this.new_lang)
                .then(beach_menu => {
                    window.notifyTab({
                        type: 'update_menu',
                        data: beach_menu
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
        } else {
            this.beachService.addBeachMenu(this.new_lang)
                .then(beach_menu => {
                    window.notifyTab({
                        type: 'new_menu',
                        data: beach_menu
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
        this.editing = false;
    }
    removeMenu() {
        if (!confirm("Are you sure you want to delete this language?")) return;
        this.beachService.deleteBeachMenu(this.beach_menu.id)
            .then(() => {
                window.notifyTab({
                    type: 'remove_menu',
                    data: false
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
    new_lang: any = false;
    languages: any = [];
    ngOnInit() {
        if (!window.notifyMenu) {
            window.notifyMenu = [];
        }
        window.notifyMenu[this.menu_index] = this.notifyMenu.bind(this);
        this.init();
    }
    init() {
        this.assetService.getLanguages()
            .then(languages => {
                this.languages = languages;
                return this.beachService.getBeachMenus()
            })
            .then(beach_menus => {
                this.beach_menu = beach_menus[this.menu_index];
                if (this.beach_menu) {
                    this.new_lang = this.beach_menu.lang;
                    this.languages.forEach(language => {
                        if (language.name === this.beach_menu.lang) {
                            this.tab_title = language.long_name;
                        }
                    });
                }
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
