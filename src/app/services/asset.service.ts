import { Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../models/index';
import { environment } from '../../environments/environment';
import { AppService } from './app.service';
import mergeImages from 'merge-images';

@Injectable()
export class AssetService {

    constructor(
        private appService: AppService
    ) {
        this.getCountries()
            .then(() => this.getPlans())
            .then(() => this.getBeachFacilities())
            .then(() => {
            })
            .catch(error => {
            })
    }

    private countries: any = false;
    async getCountries() {
        if (this.countries) return this.countries;
        const countries = await this.appService.get('assets/countries/', {}, true)
            .then(res => res.data)
        this.countries = countries;
        return this.countries;
    }

    private places: any = [];
    async getPlaces(country_id: number) {
        if (this.places[country_id]) return this.places[country_id]
        const places = await this.appService.get('assets/place/' + country_id, {}, true)
            .then(res => res.data)
        this.places[country_id] = places;
        return places;
    }

    private plans: any = false;
    async getPlans() {
        if (this.plans) return this.plans;
        const plans = await this.appService.get('assets/plans')
            .then(res => res.data)
        this.plans = plans;
        return plans;
    }

    private beachFacilities: any = false
    async getBeachFacilities() {
        if (this.beachFacilities) return this.beachFacilities;
        const beachFacilities = await this.appService.get('assets/beachfeatures')
            .then(res => res.data)
        this.beachFacilities = beachFacilities;
        return beachFacilities;
    }



    private ranks: any = false
    async getRanks() {
        if (this.ranks) return this.ranks;
        const ranks = await this.appService.get('assets/ranks')
            .then(res => res.data)
        this.ranks = ranks;
        return ranks;
    }

    private colors: any = false
    async getColors() {
        if (this.colors) return this.colors;
        const colors = await this.appService.get('assets/colors')
            .then(res => res.data)
        this.colors = colors;
        return colors;
    }

    private languages: any = false;
    async getLanguages() {
        if (this.languages) return this.languages;
        const languages = await this.appService.get('assets/languages', {}, true)
            .then(res => res.data)
        this.languages = languages;
        return languages;
    }

    async getTermsConditions() {
        try {
            const res = await this.appService.get('assets/get-terms-conditions', {}, true);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async getSupportData() {
        try {
            const res = await this.appService.get('assets/get-support-center', {}, true);
            return res;
        } catch (error) {
            throw error;
        }
    }

    private elements: any = [];
    private structures: any = [];
    async getElements() {
        if (this.elements.length) {
            return this.elements;
        }
        const elements = await this.appService.get('assets/elements')
            .then(res => res.data);
        this.elements = elements;
        return elements;
    }
    async getStructures() {
        if (this.structures.length) {
            return this.structures;
        }
        const structures = await this.appService.get('assets/structures')
            .then(res => res.data);
        this.structures = structures;
        return structures;
    }

    async getBeachElements(beach_id) {

        const elements = await this.appService.get('assets/get-beach-elements/' + beach_id)
            .then(res => res.data);
        return elements;
    }

    async getBeachStructures(beach_id) {
        const elements = await this.appService.get('assets/get-beach-structures/' + beach_id)
            .then(res => res.data);
        return elements;
    }

    async getBeachCombinations(beach_id) {
        const elements = await this.appService.get('assets/get-beach-combinations/' + beach_id)
            .then(res => res.data);
        return elements;
    }



    async updateElements(params: any) {
        try {
            const res = await this.appService.post('assets/set-beach-elements', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async updateUmbrellas(params: any) {
        try {
            const res = await this.appService.post('assets/set-beach-umbrellas', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async updateBaldaquins(params: any) {
        try {
            const res = await this.appService.post('assets/set-beach-baldaquins', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async updateStructures(params: any) {
        try {
            const res = await this.appService.post('assets/set-beach-structures', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    async updateCombinations(params: any) {
        try {
            const res = await this.appService.post('assets/set-beach-combinations', params);
            return res;
        } catch (error) {
            throw error;
        }
    }

    addFileNameSuffix(filepath, suffix = "") {
        let paths = filepath.split("."),
            ext = paths.splice(paths.length - 1, 1),
            newName = paths.join(".") + suffix + "." + ext;
        return newName;
    }

    async getMergedImage(structures, elements) {
        let sLen = structures.length,
            list = [],
            eLen = elements.length;
        const getMergedImg = async function (i, j) {
            if (i < sLen && j < eLen) {
                const elm = elements[j],
                    str = structures[i];
                const res = this.getMergedImageConfig(str, elm);
                mergeImages(res.list.all, res.size).then(b64 => {
                    list.push(b64);
                    i++;
                    if (i >= sLen) {
                        j++; i = 0;
                    }
                    if (j >= eLen) {
                        return list;
                    }
                });
            }

        };
        return await getMergedImg(0, 0);
    }



    
    getMergedImageConfig(structure, element) {
        // Preset Configs
        const uConfig = {
            width: 72,
            height: 72
        }, sConfig = {
            width: 29,
            height: 82,
            seatNoConfig: {
                a: 1,
                b: 1,
                c: 1,
                d: 1,
                m: 1,
                n: 2,
                o: 4
            }
        }, bConfig = {
            height: 86,
            maxSeatCount: 4,
            seatWidthPer: 30,
            seatWidthMaxPer: 100,
            seatNoConfig: {
                x: 2,
                y: 3,
                z: 4
            }
        };
        bConfig.seatWidthMaxPer = bConfig.seatWidthPer * bConfig.maxSeatCount;
        // Input Params
        const seat = structure.seat,
            umbrella = element.umbrella,
            sunbed = element.sunbed,
            left = (seat.a || []).length,
            right = (seat.b || []).length,
            top = (seat.c || []).length,
            bottom = (seat.d || []).length,
            center = (seat.m || seat.n || seat.o || []).length,
            isLeft = (left) ? true : false,
            isRight = (right) ? true : false,
            isCenter = (center) ? true : false,
            isTop = (top) ? true : false,
            isBottom = (bottom) ? true : false,
            seatSides = Object.keys(seat);
        let seatCount = 0,
            seatCountBaldaquin = 0,
            seatGridWidths = {
                "0": 85,
                "1": 70,
                "2": 73,
                "3": 105,
                "4": 135,// 135,
                "5": 165
            },
            seatGridCenterWidths = {
                "1": 70,
                "2": 80,
                "4": 100
            };
        for (let i = 0; i < seatSides.length; i++) {
            seatCount += seat[seatSides[i]].length;
        }
        seatCountBaldaquin = seatCount;
        let sunbedSize = 1;
        if (seat.n) {
            sunbedSize = 2;
        } else if (seat.o) {
            sunbedSize = 4;
        }
        // Initial Config
        let x = 0, y = 0,
            sbSpaceX = 2,
            sbSpaceY = 2,
            umSpaceX = Math.round(uConfig.width / 3),
            umSpaceY = 0,
            width = 0, height = sbSpaceY + sConfig.height,
            topOffset = 0,
            topBottomOffset = 0,
            leftRightOffset = uConfig.width / 5;


        // Geenerate Array
        let list = {
            left: [],
            right: [],
            top: [],
            bottom: [],
            center: [],
            umbrella: [],
            all: []
        };
        if (isTop) {
            topOffset = sConfig.height / 2 + sbSpaceY / 2;
        }
        let elementType = '';
        if (element.umbrella) {
            elementType = 'umbrella';
        } else if (element.baldaquin) {
            elementType = 'baldaquin';
        }
        let config;
        let widthPercentage = 100;
        switch (elementType) {
            case 'baldaquin':
                seatCountBaldaquin = 0;
                for (let i = 0; i < seatSides.length; i++) {
                    seatCountBaldaquin += bConfig.seatNoConfig[seatSides[i]];
                }
                //Calc seat count for umbrella
                config = {
                    b64: element.img,
                    list: [{
                        src: element.img,
                        x: 0, y: 0
                    }],
                    size: {
                        height: bConfig.height
                    },
                    umbrella: {

                    },
                    pos: {
                    }

                };

                config.maxWidthPercentage = bConfig.seatWidthMaxPer;
                config.seatWidthPer = bConfig.seatWidthPer;
                widthPercentage = (seatCountBaldaquin / bConfig.maxSeatCount) * 100;
                config.maxSeatCount = bConfig.maxSeatCount;
                config.seatCount = seatCountBaldaquin;
                config.widthPercentageGrid = bConfig.seatWidthPer * seatCountBaldaquin;
                config.widthPercentage = widthPercentage;
                break;
            case 'umbrella':

                //Place Left Things
                for (let i = 1; i <= left; i++) {
                    let ele = {
                        src: sunbed.img,
                        x,
                        y
                    };
                    list.left.push(ele); x += sConfig.width + sbSpaceX;

                }
                x = x - sbSpaceX;
                //Place Umbrella Things
                /* let umbrellaPos = x - umSpaceX * 1.25;
                 let umbrellaCenter = umbrellaPos;
                 umbrellaPos = (umbrellaPos > 0) ? umbrellaPos : x;
                 list.umbrella.push({
                     src: umbrella.img,
                     x: umbrellaPos,
                     y
                 });*/

                let umbrellaCenter = x + leftRightOffset / 2;
                let umbrellaPos = umbrellaCenter - uConfig.width / 2;
                umbrellaPos = (umbrellaPos > 0) ? umbrellaPos : x;
                list.umbrella.push({
                    src: umbrella.img,
                    x: umbrellaPos,
                    y: height - uConfig.height
                });
                x += leftRightOffset;
                umbrellaCenter = Math.round(umbrellaPos + uConfig.width / 2);

                //Plase right things
                for (let i = 1; i <= right; i++) {
                    let sunbedImg = sunbed.img;
                    if (sunbedSize > 1) {
                        sunbedImg = this.addFileNameSuffix(sunbedImg, "-" + sunbedSize);
                    }
                    let ele = {
                        src: sunbedImg,
                        x,
                        y
                    };
                    list.right.push(ele);
                    x += sConfig.width + sbSpaceX;
                }
                width = x + sbSpaceX * 2,
                    height = topOffset * 2 + sbSpaceY * 2 + sConfig.height;
                if (isCenter) {
                    // Place center Things
                    width = uConfig.width + umSpaceX * 2;
                    let sunbedImg = sunbed.img;
                    if (sunbedSize > 1) {
                        sunbedImg = this.addFileNameSuffix(sunbedImg, "-" + sunbedSize);
                    }
                    list.center.push({
                        src: sunbedImg,
                        x: umbrellaPos + uConfig.width / 2 - sConfig.width / 2 - (sunbedSize - 1) * sConfig.width / 4,
                        y
                    });
                    //list.umbrella = [];
                }
                let minWidth = uConfig.width + umSpaceX * 2;
                if (minWidth > width) {
                    width = minWidth;
                }


                list.all = list.left
                    .concat(list.right)
                    .concat(list.top)
                    .concat(list.bottom)
                    .concat(list.center)
                    .concat(list.umbrella);
                let leftOffset = umbrellaCenter / width * 100;

                let seatCount = list.left.concat(list.right).length;
                if (seatCount == 4) {
                    widthPercentage = 82;
                } else if (seatCount < 4) {
                    widthPercentage = 70;
                }

                if (isCenter && sunbedSize > 1) {
                   
                    let oldWidthPercentage = widthPercentage;
                    widthPercentage += (sunbedSize - 1) * 10;
                    width = width / oldWidthPercentage * widthPercentage;
               
                }

                config = {
                    b64: '',
                    list,
                    size: {
                        width,
                        height
                    },
                    umbrella: {
                        center: umbrellaCenter,
                        leftOffset: leftOffset
                    },
                    pos: {
                        widthLeftOuter: leftOffset,
                        widthRightOuter: 100 - leftOffset,
                        widthLeftInner: 100 / leftOffset * 100,
                        widthRightInner: 100 / (100 - leftOffset) * 100,
                        marginLeftOffset: 0
                    }
                };
                config.pos.marginLeftOffset = config.pos.widthLeftOuter / config.pos.widthRightOuter * -100;
                config.seatCount = seatCount;
                break;
            default:

                break;
        }
        if (!config) {

        }
        config.widthPercentage = widthPercentage;
        config.type = elementType;

        try {

            config.seatGridWidth = seatGridWidths[seatCount];
            if (elementType == 'umbrella' && isCenter && sunbedSize > 1) {
                config.seatGridWidth = seatGridCenterWidths[sunbedSize];
            }
        } catch (e) {

        }
        if (elementType == 'umbrella') {
            config.seatCount = seatCount;
            config.size.imgWidth = config.seatGridWidth;// config.size.width;
            config.size.width = config.size.imgWidth;
        } else {
            config.seatCount = seatCountBaldaquin;
            // config.size.imgWidth = config.size.width;
        }


        return config;
    }

}