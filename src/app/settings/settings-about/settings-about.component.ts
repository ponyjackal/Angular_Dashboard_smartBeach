import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { UserService, AssetService, BeachService, AppService } from '../../services/index';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

declare const google: any;
declare const $: any;
declare const window: any;
var me: any;

@Component({
    selector: 'app-settings-about-cmp',
    templateUrl: './settings-about.component.html',
    styleUrls: ["./settings-about.component.scss"]
})
export class SettingsAboutComponent implements OnInit {

    beachInfo: FormGroup;
    frmSetInfo: FormGroup;

    countries = [];
    infocopy = [];
    info:any = [];
   // info:any = [''];
    places = [];
    beach: any = {};
    beachFacilities: any = false;
    map: any = false;
    centerMaker: any = false;
    facilities: any = {};
    beachLoaded: boolean = false;
    beachGalleries = [];
    savedBeachInfo = true;
    addingInfo = false;
    changedInfo = false;

    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private beachService: BeachService,
        private assetService: AssetService,
        private translate: TranslateService,
        private appService: AppService,
        private router: Router,
    ) {
        this.translate.use(this.appService.getLang());
    }

    getFacilityIconClass(id: number, state): string {
        const idStr = ("0" + id).slice(-2);
        return `facilityIconClass beach_facilities_${idStr}_${state}_icon`;
    }
    onChangeCountry($event) {
        if (this.beach.country_id) {
            this.changedBeachInfo = true;
            $('#country_container').removeClass('is-empty')
            this.assetService.getPlaces(this.beach.country_id).then((places) => {
                this.places = places;
                if (!this.beachLoaded && typeof (this.beach.id) === 'string') {
                    this.beachLoaded = true
                } else if (this.places.length > 0) {
                    this.beach.place_id = this.places[0].id;
                }
            })
        }
    }

    onChangeName($event) {
        $('#name_container').removeClass('is-empty');
        this.changedBeachInfo = true;
    }
    onChangePlace($event) {
        if (this.beach && this.beach.place_id) {
            this.changedBeachInfo = true;
            $('#place_container').removeClass('is-empty')
            if (!this.beachLoaded && typeof (this.beach.id) === 'string') return
            this.places.forEach(place => {
                if (place.id === this.beach.place_id) {
                    this.latitude = place.latitude;
                    this.longitude = place.longitude;
                    this.ChangeLatLong();
                }
            })
        }
    }

    cursorOnMap = true;

    initMap() {
        let myLatlng = new google.maps.LatLng(this.latitude, this.longitude);

        const mapOptions = {
            zoom: 8,
            center: myLatlng,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                mapTypeIds: ['roadmap', 'terrain']
            }
        };

        this.map = new google.maps.Map(document.getElementById('regularMap'), mapOptions);

        this.centerMaker = new google.maps.Marker({
            position: myLatlng,
            draggable: true,
            map: this.map,
            title: 'Regular Map!'
        });

        this.centerMaker.addListener('dragend', this.moveMarker);
        google.maps.event.addListenerOnce(this.map, 'idle', function () {
            me.initLoad()
        });

    }

    moveMarker(event) {
        me.changedLocation = true;
        me.latitude = event.latLng.lat();
        me.longitude = event.latLng.lng();
    }

    ChangeLatLong() {
        if (this.latitude && this.longitude) {
            this.changedLocation = true;
            let myLatlng = new google.maps.LatLng(this.latitude, this.longitude);
            this.map.panTo(myLatlng);
            this.centerMaker.setPosition(myLatlng);
        }
    }
    changeFacilities(feature) {
        this.changedFacilities = true;
        this.facilities[feature] = !this.facilities[feature];
    }

    saveBeachInfo() {
        this.changedBeachInfo = false;
        if (typeof (this.beach.id) === 'string') {
            const { name, country_id, place_id } = this.beach;
            this.updateBeach({ name, country_id, place_id })
        } else {
            this.addNewBeach();
        }
    }
    addNewBeach() {
        const { name, country_id, place_id } = this.beach;
        this.beachService.addNewBeach({ name, country_id, place_id })
            .then((beach) => {
                return this.initLoad();
            })
            .catch(error => {
            });
    }
    setValue(event:any ,index){
        this.infocopy[index] = event.target.value;        
        this.changedInfo = true
    }


    saveAgreement(info){

        this.beachService.saveAgreement(info)
            .then((info) => {
                this.changedInfo = false;
                
            })
            .catch(error => {
            });

    }

    saveLocation() {
        this.changedLocation = false;
        const { latitude, longitude } = this;
        this.appService.getTimezone(latitude, longitude)
            .then(data => {
                if (data.status === "OK") {
                    const timezone = data.timeZoneId;
                    if (!this.beach.settings) {
                        return this.beachService.createBeachSettings(timezone, latitude, longitude)
                            .then(beach => {
                                this.beach = beach;
                            });
                    } else {
                        return this.updateBeachSettings({ timezone, latitude, longitude });
                    }
                } else {
                    this.translate.get('SETTINGS.ABOUT.LOCATION_ERROR')
                        .subscribe(result => {
                            swal({
                                type: 'error',
                                title: '',
                                confirmButtonClass: 'btn btn-info',
                                text: result,
                                buttonsStyling: false,
                            }).catch(swal.noop);
                        })
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

    saveFacilities() {
        this.changedFacilities = false;
        var features = [];
        this.beachFacilities.forEach(facility => {
            if (this.facilities[facility.name]) {
                features.push(facility.name);
            }
        })
        this.updateBeach({ features });
    }

    changeGallery($event, galleryID) {
        //$($event.target).preventDefault();
        $event.preventDefault();
        this.beachService.updateGallery(galleryID, $event.target.files[0])
            .then(gallery => {
                this.beachGalleries.forEach((item, index) => {
                    if (galleryID === item.id) {
                        this.beachGalleries[index] = gallery;
                    }
                })
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
    addGallery($event) {
        if (this.beachGalleries.length > 3) return;
        this.beachService.addGallery($event.target.files[0])
            .then(gallery => {
                const remove = $($event.target).parent().parent().find('a');
                remove.click();
                this.beachGalleries.push(gallery);
            })
            .catch(error => {
                $('#new_pablo').trigger('click');
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
    setMainGallery(gallery_id) {
        this.beachService.setMainGallery(gallery_id)
            .then(data => {
                return this.beachService.getBeachGalleries();
            })
            .then(galleries => {
                this.beachGalleries = galleries;
            })
    }
    removeGallery(galleryID) {
        this.beachService.removeGallery(galleryID)
            .then(result => {
                this.beachGalleries.forEach((item, index) => {
                    if (galleryID === item.id) {
                        this.beachGalleries.splice(index, 1);
                    }
                })
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

    // saveDescription() {
    //     this.changedDescription = false;
    //     const { description } = this.beach;
    //     this.updateBeach({ description: description || ' ' })
    // }
    private updateBeachSettings(settings) {
        this.beachService.updateBeachSettings(settings)
            .then(settings => {
                this.beach.settings = settings;
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

    private updateBeach(beach) {
        this.beachService.updateBeach({ id: this.beach.id, ...beach })
            .then(beach => {
                this.beach = {
                    ...beach,
                    ...this.beach
                };
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

    changedBeachInfo = false;
    changedLocation = false;
    changedFacilities = false;
    changedDescription = false;

    ngOnInit() {
        me = this;
        this.beachInfo = this.formBuilder.group({
            name: ['', Validators.required],
            country_id: [''],
            place_id: [''],
            //companyZipcode: ['']
        });
        if (google && google.maps && google.maps.Map) {
            this.initMap();
        } else {
            window.initMap = this.initMap.bind(this);
        }

        this.getAgreement();
    }

    getAgreement(){
        this.beachService.getAgreementList()
    .then(data => {
        if(data.agreement){
        this.info = data.agreement;
        this.infocopy = [].concat(this.info);
        }
        else{
            this.info = ["The time you have to honor this reservation is 200 minutes","If this period has passed and the beach has not confirmed that you have arrived, you have a maximum of 508 reservations remaining","Failure to repeat in a repeated manner will result in blocking this phone number for an indefinite period of time.","You can change the position of the umbrella / baldaquin chosen at any time of the day. Please contact the beach representant for this","If u release the reservation before  00:00 the beach rewards you with 0 % of that day value as loyalty points. If u release a full day, the beach rewards you with 0 % of that day value as loyalty points. These points you can use them later on for paying another reservation."];
            this.infocopy = [].concat(this.info);
        }
    })
    .catch(error => {
    });
    }

    latitude = 45.4832432;
    longitude = 28.23245813;
    async initLoad() {
        this.beachService.checkLogic(this.beachService.CHECK.BEACH_ABOUT)
            .then(() => this.assetService.getCountries())
            .then((countries) => {
                this.countries = countries;

                return this.assetService.getBeachFacilities()
                    .then(beachFacilities => {
                        this.beachFacilities = beachFacilities;
                        beachFacilities.forEach(feature => {
                            this.facilities[feature.name] = false;
                        })
                        return this.beachService.getBeach();
                    })
                    .then(beach => {
                        this.beach = beach
                        if (beach.features) {
                            beach.features.forEach(feature => {
                                this.facilities[feature] = true;
                            })
                        }
                        if (beach.settings) {
                            this.latitude = beach.settings.latitude;
                            this.longitude = beach.settings.longitude;
                            this.ChangeLatLong();
                        }
                        return this.beachService.getBeachGalleries();
                    })
                    .then(galleries => {
                        this.beachGalleries = galleries;
                        this.changedBeachInfo = false;
                        this.changedLocation = false;
                        this.changedFacilities = false;
                        this.changedDescription = false;
                    }).catch(error => {
                    })
            })
            .catch(error => {
                if (error.type === 'auth') return;
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
                    })
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

    addNewInfo(){
        this.addingInfo = false;

    }
}
