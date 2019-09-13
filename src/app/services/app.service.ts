import { Injectable, EventEmitter } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AppService {

    public baseURL = environment.baseURL;
    private googleAPIKey = environment.googl_api_key;
    public authInfo: any = false;
    private beach: any = false;
    public loggedin = false;

    public notifyBottom: EventEmitter<boolean> = null;

    constructor(
        private router: Router,
    ) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.authInfo = currentUser || {};
        } catch (error) {
            this.authInfo = { lang: 'ro' };
        }
    }

    clear() {
        this.authInfo = {lang: this.authInfo.lang};
        this.beach = false;
        this.loggedin = false;
    }

    setAutoInfo(user) {
        this.authInfo = {
            ...this.authInfo,
            ...user,
        };
        localStorage.setItem('currentUser', JSON.stringify(this.authInfo));
    }
    setLang(lang) {
        this.authInfo = {
            ...this.authInfo,
            lang,
        };
        localStorage.setItem('currentUser', JSON.stringify(this.authInfo));
    }
    getLang() {
        if (typeof (this.authInfo.lang) === 'string' && this.authInfo.lang.length === 2) {
            return this.authInfo.lang;
        } else {
            return 'ro';
        }
    }
    fullURL(url) {
        return `${this.baseURL}${url}?lang=${this.getLang()}`;
    }

    publicUrl(url) {
        return `${environment.apiURL}${url}?lang=${this.getLang()}`;
    }

    async getBeach() {
        try {
            if (this.beach) { return this.beach; }
            const beach = await this.get('beach')
                .then(res => res.data)
                .catch(error => { throw error; });
            this.beach = beach;
            return this.beach;
        } catch (error) {
            console.log('here is the error');
            throw error;
        }
    }
    updateBeach(beach) {
        this.beach = {
            ...this.beach,
            ...beach,
        };
    }

    updateBeachSettings(beach_settings) {
        this.beach.settings = beach_settings;
    }

    post(url: string, body: any, noToken: boolean = false) {
        if (!noToken) { this.validRequest(url); }
        Object.keys(body).forEach(key => {
            if (body[key] === '' || body[key] === undefined || body[key] === null) {
                delete body[key];
            }
        });
        return axios.post(this.fullURL(url), body, {
            headers: {
                'X-Access-Token': this.authInfo.token
            }
        })
            .then(res => {
                return res.data;
            }).catch(errorRes => {
                if (!errorRes.response)  {
                    throw {
                        name: 'Network Error',
                        message: 'Network Error: Please check your connection.',
                    };
                }
                const error = errorRes.response.data.error;
                if (error.code !== 505) { throw error; }
                this.router.navigateByUrl('/login');
                throw {
                    type: 'auth',
                    message: 'BAD REQUEST'
                };
            });
    };

    async multipart(url: string, body: FormData, noToken: boolean = false) {
        if (!noToken) { this.validRequest(url); }
        return axios.post(this.fullURL(url), body, {
            headers: {
                'X-Access-Token': this.authInfo.token,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                return res.data;
            }).catch(errorRes => {
                if (!errorRes.response) {
                    throw {
                        name: 'Network Error',
                        message: 'Network Error: Please check your connection.',
                    };
                }
                const error = errorRes.response.data.error;
                if (error.code !== 505) { throw error; }
                this.router.navigateByUrl('/login');
                throw {
                    type: 'auth',
                    message: 'BAD REQUEST'
                };
            });
    };
    validRequest = (url) => {
        if (this.authInfo.token === undefined) {
            if (this.router.url !== '/login') {
                this.router.navigateByUrl('/login');
            }
            throw {
                type: 'auth',
                message: 'BAD REQUEST'
            };
        }
    }
    async get(url: string, query?: object, noToken: boolean = false, publicUrl: boolean = false) {
        if (!noToken) {
            this.validRequest(url);
        }
        let fullurl = this.fullURL(url);
        if (publicUrl) {
            fullurl = this.publicUrl(url);
        }
        if (query) {
            Object.keys(query).forEach(key => {
                fullurl += `&${key}=${query[key]}`;
            });
        }
        return axios.get(fullurl, {
            headers: {
                'X-Access-Token': this.authInfo.token
            }
        })
            .then(res => {
                return res.data;
            }).catch(errorRes => {
                if (!errorRes.response) {
                    throw {
                        name: 'Network Error',
                        message: 'Network Error: Please check your connection.',
                    };
                }
                const error = errorRes.response.data.error;
                if (error.code !== 505) {
                    throw error;
                }
                this.router.navigateByUrl('/login');
                throw {
                    type: 'auth',
                    message: 'BAD REQUEST'
                };
            });
    }
    async getTimezone(lat, lng) {
        return axios.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},` +
                        `${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${this.googleAPIKey}`)
        .then(res => res.data);
    }
}
