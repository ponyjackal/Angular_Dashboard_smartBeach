import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from './services';

declare var $: any;

@Component({
    selector: 'app-my-app',
    templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

    constructor(
        private translate: TranslateService,
        private appService: AppService,
    ) {
        this.translate.setDefaultLang('ro');
    }

    ngOnInit() {
        $.material.init();
    }
}
