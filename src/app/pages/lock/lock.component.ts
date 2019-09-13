import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../services';

declare var $: any;

@Component({
    selector: 'app-lock-cmp',
    templateUrl: './lock.component.html'
})

export class LockComponent implements OnInit {
    constructor(
		private translate: TranslateService,
		private appService: AppService,
	) {
		this.translate.use(this.appService.getLang());
    }
    test: Date = new Date();
    ngOnInit() {
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700);
    }
}
