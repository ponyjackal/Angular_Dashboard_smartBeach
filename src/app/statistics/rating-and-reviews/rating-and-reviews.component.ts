import { Component, OnInit, HostListener, EventEmitter, OnDestroy } from '@angular/core';
import { AppService, BeachService } from '../../services';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as moment from 'moment';

declare var $: any;
@Component({
    selector: 'app-rating-and-reviews-cmp',
    templateUrl: 'rating-and-reviews.component.html',
    styleUrls: ['./rating-and-reviews.component.css']
})

export class RatingAndReviewsComponent implements OnInit, OnDestroy {

    constructor(
        private appService: AppService,
        private beachService: BeachService,
        private router: Router,
    ) {

    }
    timeline_class: Array<string> = ['', 'danger', 'warning', 'yellow', 'green-yellow', 'success'];
    average_rate = 0;
    rating_map = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
    };
    rating = {
        one: 0,
        two: 0,
        three: 0,
        four: 0,
        five: 0
    };
    reviews = [];
    review_count = 0;
    page_number = 1;
    has_more = true;

    ngOnInit() {
        this.reviews = [];
        this.beachService.getRatingAndReviewCount()
            .then(([rating, review]) => {
                this.rating = rating;
                let rating_count = 0, sum = 0;
                Object.keys(this.rating).forEach(key => {
                    if (Object.keys(this.rating_map).indexOf(key) < 0) {
                        return ;
                    }
                    rating_count += this.rating[key];
                    sum += this.rating[key] * this.rating_map[key];
                });
                this.average_rate = rating_count === 0 ? 0 : (Math.floor(sum / rating_count * 10) / 10);
                this.review_count = review.count;
                return this.beachService.getReviews(this.page_number);
            })
            .then(result => {
                this.has_more = result.has_more;
                this.reviews = result.reviews;
                this.appService.notifyBottom = new EventEmitter<boolean>();
                this.appService.notifyBottom.subscribe(() => {
                    this.loadMore();
                });
                this.updateCreatedDate();
            })
            .catch(error => {
                if (error.type === 'auth') {
                    return;
                }
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
                    });
                } else {
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                }
            });
    }
    ngOnDestroy() {
        this.appService.notifyBottom.unsubscribe();
        this.appService.notifyBottom = null;
    }
    loadMore() {
        if (!this.has_more) {
            return;
        }
        this.page_number++;
        this.beachService.getReviews(this.page_number)
            .then(result => {
                this.has_more = result.has_more;

                this.reviews = this.reviews.concat(result.reviews);
                this.updateCreatedDate();
            })
            .catch(error => {
                if (error.type === 'auth') {
                    return;
                }
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
                    });
                } else {
                    swal({
                        type: 'error',
                        title: '',
                        confirmButtonClass: 'btn btn-info',
                        text: error.message,
                        buttonsStyling: false,
                    }).catch(swal.noop);
                }
            });
    }
    updateCreatedDate() {
        this.reviews.forEach((item, index) => {
            this.reviews[index].before = moment(new Date(item.created_at)).format('YYYY-MM-DD HH:mm');
        });
    }
}
