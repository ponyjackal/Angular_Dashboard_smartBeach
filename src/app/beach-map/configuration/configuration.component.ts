import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import "rxjs/add/observable/of";
import { BeachService, AppService, AssetService } from "../../services";
import swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import mergeImages from 'merge-images';
import { debug } from "util";
import { element } from "protractor/built";
import "rxjs/add/observable/of";
import { last, sequenceEqual } from "rxjs/operators";
declare const Konva: any;
declare const $: any;
let configurationComponent = null;
import { environment } from '../../../environments/environment';

@Component({
    selector: "app-configuration-beach-map-cmp",
    templateUrl: "./configuration.component.html",
    styleUrls: ["./configuration.component.scss"]
})
export class ConfigurationComponent implements OnInit {
    public simpleSlider = 10;
    public downFlag = false;
    private createContainer: any;
    gridValue = "1600 X 600";
    private beach: any;
    public last_seat: any = null;
    public elements = [];
    public seatNumberArray = {};
    private beach_grid: any;
    public elementsLoaded = {
        element: false,
        structure: false
    };
    public imgPath = null;
    umbrellas: any = [];
    baldaquins: any = [];
    sunbeds: any = [];
    structures: any = [];
    structuresUmbrella: any = [];
    structuresBaldaquin: any = [];
    combinations: any = [];
    editList = [{}];
    maxListCount = 3;
    currentlyEditing: any = {

    };
    public clearCache = "reload=true";
    public gridScaleRatio = 0.5;
    public staticElements = [];
    public savedCombinations = [];
    public combinationLoaded = false;
    public dataChanged = false;
    public baldaquinChanged = false;
    public umbrellaChanged = false;
    public structureChanged = false;
    public dataSaving = false;
    public selectedBaldaquins = [];
    public structureSelected = false;
    public structureUmbrellaSelected = false;
    public structureBaldaquinSelected = false;
    public structureUmbrellaSaved = false;
    public structureBaldaquinSaved = false;

    public validUmbrella = false;
    public structureSaved = true;
    public backupStructureUmbrella = "";
    public backupStructureBaldaquin = "";

    public umbrellaSaved = true;
    public backupUmbrella = "";

    public baldaquinSaved = true;
    public backupBaldaquin = "";
    public thingsLoaded = false;
    public dynamicComponentsLoaded = true;
    public dependencyErrorMsg = "";

    public lastPos = {
        id: -1,
        x: 0,
        y: 0
    };
    public bookings = [];
    public idOffset = 0;
    public noOffset = 0;
    public published = true;
    public mapLoading = false;
    constructor(
        private beachService: BeachService,
        private translate: TranslateService,
        private appService: AppService,
        private assetService: AssetService,
        private router: Router
    ) {

        this.translate.use(this.appService.getLang());
        configurationComponent = this;
        this.loadSavedElements();
        this.appService.getBeach().then((beach) => {
            this.beach = beach;
            this.imgPath = environment.imgURL + 'uploads/' + beach.id + "/elements/";
            this.loadElements();
            this.loadStructures();
            this.loadBeachCombinations();
        }).catch((error) => {
            console.error("Error getting beach info");
        });
        this.translate.get("BEACHMAP.DEPENDENCY_ERROR_MSG").subscribe(res => {
            this.dependencyErrorMsg = res;
        });

    }
    public scroll_uid: any;
    doScrolling(id, dir) {
        let that = this;
        let offset = 150;
        let cont: any = document.querySelector("#scroll-cont-" + id);
        let scr: any = document.querySelector("#scrollable-" + id);
        if (!(cont && scr)) {
            setTimeout(() => {
                that.doScrolling(id, dir);
            }, 200);
            return;
        }

        let width = cont.offsetWidth;
        let scrollWidth = cont.scrollWidth;
        let scrollLeft = cont.scrollLeft;
        let newLeft = scrollLeft;
        let maxLeft = scrollWidth - width;
        if (dir == 'left') {
            newLeft -= offset;
        } else {
            newLeft += offset;
        }
        if (newLeft < 0) {
            newLeft = 0;
        }
        if (newLeft > maxLeft) {
            newLeft = maxLeft;
        }
        this.scroll_uid = new Date().getTime();
        var moveScroll = function (element, scrollLeftOffset, uuid) {
            if (uuid === this.scroll_uid) {
                let element_left = element.scrollLeft;
                if (element_left + 1 <= scrollLeftOffset) {
                    element_left++;
                } else if (element_left - 1 >= scrollLeftOffset) {
                    element_left--;
                } else {
                    element_left = scrollLeftOffset;
                }
                element.scrollLeft = element_left;
                setTimeout(() => {
                    moveScroll(element, scrollLeftOffset, uuid);
                }, window['scroll_wait'] || 0);
            }
        }.bind(this);
        moveScroll(cont, newLeft, this.scroll_uid);
        //cont.scrollLeft = newLeft;
        let arr: any = document.querySelector("#scroll-cont-" + id + " .list-arrow-box");
        if (arr && arr.style) {
            arr.style.left = newLeft + "px";
        }
    }
    goHome() {
        window.location.href = "/";
    }
    isValidUmbrella() {
        const list = this.editList;
        let validUmbrella = false;
        list.map((ele: any) => {
            if (ele.sunbed && ele.umbrella) {
                validUmbrella = true;
            }
        });
        this.validUmbrella = validUmbrella;
    }

    removeEditList(row) {
        let ind = this.editList.indexOf(row);
        if (ind > -1) {
            this.editList.splice(ind, 1);
        }
        if (!this.editList.length) {
            this.addItemtoList();
        }
        this.umbrellaChanged = true;
        this.refreshBackUp('umbrella');
        this.isValidUmbrella();
        // this.r//efreshCombinations();
    }
    addItemtoList() {
        this.editList.push({});
        return;
        /*
                const umbrella = this.currentlyEditing.umbrella,
                    sunbed = this.currentlyEditing.sunbed;
                if (umbrella && sunbed) {
                    this.editList.push({
                        umbrella, sunbed
                    });
                    this.currentlyEditing = {
        
                    };
                } else {
                    console.error("Data not given");
                }*/
    }
    saveBeachElements(showMsg = true) {
        this.umbrellaChanged = false;
        const elements = [];
        this.editList.map((element: any) => {
            if (element.umbrella && element.sunbed) {
                elements.push(element);
            }
        });
        if (!elements.length) {
            let gridCount = this.checkGridForElements();
            if (gridCount.umbrella) {
                swal({
                    type: "error",
                    title: "",
                    confirmButtonClass: "btn btn-info",
                    text: this.dependencyErrorMsg,
                    buttonsStyling: false
                }).catch(swal.noop);
                return;
            }
        }
        this.dynamicComponentsLoaded = false;
        const params = {
            beach_id: this.beach.id,
            elements
        };
        this.assetService.updateUmbrellas(params).then((res) => {
            this.refreshBackUp('umbrella', true);
            this.isValidUmbrella();
            this.refreshCombinations();
            if (showMsg) {
                alert("Saved to database");
            }

            /* if(res && res.data) {
                const elements = JSON.parse(res.data.elements);
                this.editList = elements;
            } */
        }).catch((error) => {
            this.editList = [{}];
        });
    }
    saveBeachBaldaquins(showMsg = true) {

        this.baldaquinChanged = false;
        const baldaquins = [];
        const selectedBaldaquins = [];
        this.baldaquins.map((baldaquin) => {
            if (baldaquin.active) {
                baldaquins.push({
                    baldaquin
                });
                selectedBaldaquins.push(baldaquin);
            }
        });
        this.selectedBaldaquins = selectedBaldaquins;
        if (!selectedBaldaquins.length) {
            let gridCount = this.checkGridForElements();
            if (gridCount.baldaquin) {
                swal({
                    type: "error",
                    title: "",
                    confirmButtonClass: "btn btn-info",
                    text: this.dependencyErrorMsg,
                    buttonsStyling: false
                }).catch(swal.noop);
                return;
            }
        }
        this.dynamicComponentsLoaded = false;
        const params = {
            beach_id: this.beach.id,
            elements: baldaquins
        };
        this.assetService.updateBaldaquins(params).then((res) => {
            this.refreshBackUp('baldaquin', true);
            this.refreshCombinations();

            if (showMsg) {
                alert("Saved to database");
            }
            /* if(res && res.data) {
                const elements = JSON.parse(res.data.elements);
                this.editList = elements;
            } */
        }).catch((error) => {
            this.editList = [{}];
        });
    }
    saveBeachStructures() {
        this.structureChanged = false;
        let count = {
            baldaquin: 0,
            umbrella: 0
        };
        let invalid = false;
        var structures = [],
            list = [this.structuresUmbrella, this.structuresBaldaquin];
        let gridData = this.checkGridForElements();
        list.map(li => {
            li.map(item => {
                if (item.active) {
                    structures.push(item);
                    count[item.type]++;
                } else {
                    if (gridData.structures.indexOf(item.id) > -1) {
                        invalid = true;
                        item.active = true;
                    }
                }
            });
        });

        if (invalid) {
            swal({
                type: "error",
                title: "",
                confirmButtonClass: "btn btn-info",
                text: this.dependencyErrorMsg,
                buttonsStyling: false
            }).catch(swal.noop);
            this.structureChanged = true;
            return;
        }



        this.dynamicComponentsLoaded = false;

        const params = {
            beach_id: this.beach.id,
            structures: structures
        };
        this.assetService.updateStructures(params).then((res) => {
            this.isStructureSelected(true);
            this.refreshCombinations();
            alert("Saved to database");
            /* if(res && res.data) {
                const elements = JSON.parse(res.data.elements);
                this.editList = elements;
            } */
        }).catch((error) => {

        });
    }

    setCombinationsLoaded() {
        let that = this;
        this.clearCache = "s" + Math.random();
        setTimeout(() => {
            that.combinationLoaded = true;
        }, 1000);
    }
    async updateGrids(combs: any[]) {
        let list = [];
        combs.map((li) => {
            list.push({
                image: li.image,
                list: li.list
            });
        });
        await this.beachService.updateBeachGridImages(list);
        
    }
    saveBeachCombinations() {

        const that = this;
        if (!that.thingsLoaded) {
            that.thingsLoaded = true;
            return;
        }
        let combinations = [].concat(that.savedCombinations);
        let newCombination = [];
        const isDataString = function (dataStr) {
            return dataStr.search('data') == 0;
        }
        let bList = [];
        const saveCombination = function () {
            let editList = [].concat(this.editList);

            let used = this.checkGridForElements().usedUmbrella;
            while (used > editList.length) {
                editList.push(editList[editList.length - 1]);
            }
            this.setCombinationsLoaded();
            this.clearCache = "s" + Math.random();
            let params;
            if (!combinations.length) {
                this.updateGrids(newCombination);
                newCombination.filter(comb => {
                    delete comb.b64;
                });
                let params = {
                    beach_id: this.beach.id,
                    combinations: newCombination
                };
                this.assetService.updateCombinations(params).then((res) => {
                    this.savedCombinations = newCombination;
                    let me = this;

                    setTimeout(() => {
                        me.dynamicComponentsLoaded = true;
                    }, 700);
                    this.loadBeachGrid();
                    this.setCombinationsLoaded();

                }).catch((error) => {

                });
                return;
            };

            let combination = combinations.pop(),
                getImageName = function (el) {
                    let imageUrl = "";

                    try {
                        if (el.type === 'baldaquin') {
                            if (bList.indexOf(el.b64) == -1) {
                                bList.push(el.b64);
                            }
                            let bId = bList.indexOf(el.b64) + 1;
                            imageUrl = bId + "_" + el.seatCount;
                        } else {
                            let structure = el.structure;
                            if (structure) {
                                let seat = structure.seat,
                                    keys = Object.keys(seat);
                                if (keys.length === 1 && "mno".search(keys[0]) > -1) {
                                    switch (keys[0]) {
                                        case 'm':
                                            imageUrl = "1_1";
                                            break;
                                        case 'n':
                                            imageUrl = "1_2";
                                            break;
                                        case 'o':
                                            imageUrl = "1_4";
                                            break;
                                        default:

                                            break;
                                    }
                                } else {
                                    for (let i = 0; i < keys.length; i++) {
                                        let key = keys[i];
                                        let list = seat[key];
                                        if (imageUrl) {
                                            imageUrl += "+";
                                        }
                                        for (let j = 0; j < list.length; j++) {
                                            imageUrl += "1";
                                        }
                                    }
                                }

                            }
                        }
                        if (imageUrl) {
                            imageUrl += ".png";
                        }
                    } catch (e) {

                    }
                    return imageUrl;
                }.bind(this),
                imgUrl = getImageName(combination),
                subFolder = combination.element.folder;


            if (!(imgUrl && subFolder)) {
            }
            if (isDataString(combination.b64)) {

                this.beachService.uploadImage(combination.b64, imgUrl, subFolder).then((res) => {
                    combination.image = res;
                    newCombination.push(combination);
                    saveCombination();
                }).catch((error) => {

                });
            } else {
                mergeImages([{
                    src: combination.b64,
                    x: 0, y: 0
                }]).then((b64: any) => {
                    this.beachService.uploadImage(b64, imgUrl, subFolder).then((res) => {
                        combination.image = res;
                        newCombination.push(combination);
                        saveCombination();
                    }).catch((error) => {

                    });
                })
                /* combination.image = combination.b64;
                newCombination.push(combination);
                saveCombination(); */
            }

        }.bind(this);

        that.beachService.removeUplads().then((res) => {
            saveCombination();
        }).catch((eerr) => {

        });
    }



    saveBeachCombinations2() {
        if (!this.thingsLoaded) {
            this.thingsLoaded = true;
            return;
        }
        let combinations = [].concat(this.savedCombinations);
        const saveCombination = function (clearAll = false) {
            let params;
            if (clearAll) {
                params = {
                    beach_id: this.beach.id,
                    combinations: [],
                    clearAll: true
                };
            } else {
                if (!combinations.length) {


                    return;
                }
                let combination = combinations.pop();
                params = {
                    beach_id: this.beach.id,
                    clearAll: false,
                    combinations: [combination]
                };
            }

            this.assetService.updateCombinations(params).then((res) => {
                saveCombination();
            }).catch((error) => {
                //
            });
        }.bind(this);
        saveCombination(true);
    }


    saveBeachAllInfo() {
        // Save Structures, Elements, Combinations
        this.dataSaving = true;
        this.dataChanged = false;
        let combinations = [].concat(this.savedCombinations);
        const saveCombination = function (clearAll = false) {
            let params;
            if (clearAll) {
                params = {
                    beach_id: this.beach.id,
                    combinations: [],
                    clearAll: true
                };
            } else {
                if (!combinations.length) {
                    this.dataSaving = false;
                    return;
                }
                let combination = combinations.pop();
                params = {
                    beach_id: this.beach.id,
                    clearAll: false,
                    combinations: [combination]
                };
            }
            this.assetService.updateCombinations(params).then((res) => {
                saveCombination();
            }).catch((error) => {
                console.error(error);
            });
        }.bind(this);
        const saveStructures = function () {
            var structures = [],
                list = [this.structuresUmbrella, this.structuresBaldaquin];
            list.map(li => {
                li.map(item => {
                    if (item.active) {
                        structures.push(item);
                    }
                });
            });
            const params = {
                beach_id: this.beach.id,
                structures: structures
            };
            this.assetService.updateStructures(params).then((res) => {
                //Save combinations
                saveCombination(true);
            }).catch((error) => {
                console.error(error);
            });
        }.bind(this);
        //Save Elements

        const saveElements = function () {
            const list = [].concat(this.editList);
            this.selectedBaldaquins.map((baldaquin) => {
                list.push({
                    baldaquin
                });
            });
            const params = {
                beach_id: this.beach.id,
                elements: list
            };
            this.assetService.updateElements(params).then((res) => {
                // Save Structures
                saveStructures();
            }).catch((error) => {
                console.error(error);
                this.editList = [{}];
            });
        }.bind(this);
        saveElements();

    }
    loadBeachElements() {
        this.assetService.getBeachElements(this.beach.id).then((res) => {
            let list = [];
            try {
                list = Array.isArray(res) ? res : JSON.parse(res);
                if (!list.length) {
                    list = [{}];
                }
            } catch (e) {
                list = [{}];
            }
            const umbrellas = [],
                baldaquins = [];
            list.map((li) => {
                if (li.baldaquin) {
                    baldaquins.push(li.baldaquin);
                    let id = li.baldaquin.id;
                    this.baldaquins.map((baldaquin) => {
                        if (baldaquin.id == id) {
                            baldaquin.active = true;
                        }
                    });
                } else {
                    umbrellas.push(li);
                }
            });
            this.editList = umbrellas;
            this.selectedBaldaquins = baldaquins;
            if (!this.editList.length) {
                this.editList = [{}];
            }
            this.refreshBackUp('umbrella', true);
            this.refreshBackUp('baldaquin', true);
            this.isValidUmbrella();
            this.elementsLoaded.element = true;
            this.checkSavedCombinations();
        }).catch((error) => {
            this.editList = [{}];
            this.isValidUmbrella();
        });
    }
    checkSavedCombinations() {
        const that = this;
        if (this.elementsLoaded.element && this.elementsLoaded.structure) {
            setTimeout(() => {
                //  that.refreshCombinations();
            }, 1000);
        }
    }
    loadBeachStructures() {
        this.assetService.getBeachStructures(this.beach.id).then((res) => {
            if (res) {
                const list = Array.isArray(res) ? res : JSON.parse(res),
                    loopList = [this.structuresUmbrella, this.structuresBaldaquin];
                for (let a = 0; a < loopList.length; a++) {
                    const structures = loopList[a];
                    for (let i = 0; i < list.length; i++) {
                        const id = list[i].id;
                        for (let j = 0; j < structures.length; j++) {
                            const li = structures[j];
                            if (li.id === id) {
                                this.structureSelected = true;
                                li.active = true;
                                break;
                            }
                        }
                    }
                }
                this.isStructureSelected(true);
                this.elementsLoaded.structure = true;
                this.checkSavedCombinations();

            }
            try {
                //    this.structures = Array.isArray(res) ? res : JSON.parse(res);

            } catch (e) {
                //  this.structures = [];
            }
        }).catch((error) => {
            //this.structures = [];
        });
    }

    loadBeachCombinations() {
        this.assetService.getBeachCombinations(this.beach.id).then((res) => {
            try {
                this.savedCombinations = Array.isArray(res) ? res : JSON.parse(res);
                if (!this.savedCombinations.length) {
                    this.savedCombinations = [];
                }

            } catch (e) {
                this.savedCombinations = [];
            }
            this.setCombinationsLoaded();
            // this.saveBeachCombinations();
        }).catch((error) => {
            this.savedCombinations = [];
        });
    }
    loadStructures() {
        let that = this;
        this.assetService.getStructures().then((res: any) => {
            this.structures = res;
            this.structures.map(item => {
                if (item.type === 'umbrella') {
                    this.structuresUmbrella.push(item);
                } else if (item.type === 'baldaquin') {
                    this.structuresBaldaquin.push(item);
                }
            });
            this.loadBeachStructures();
        });
        /* this.structures = [
            { id: '1', img: 'assets/img/structure/1.png', priority: 1, type: '' },
            { id: '2', img: 'assets/img/structure/2.png', priority: 1, type: '' },
            { id: '3', img: 'assets/img/structure/3.png', priority: 1, type: '' },
            { id: '4', img: 'assets/img/structure/4.png', priority: 1, type: '' },
            { id: '5', img: 'assets/img/structure/5.png', priority: 1, type: '' },
            { id: '6', img: 'assets/img/structure/6.png', priority: 1, type: '' },
            { id: '7', img: 'assets/img/structure/7.png', priority: 1, type: '' },
            { id: '8', img: 'assets/img/structure/8.png', priority: 1, type: '' },
            { id: '9', img: 'assets/img/structure/9.png', priority: 1, type: '' },
            { id: '10', img: 'assets/img/structure/10.png', priority: 1, type: '' },
            { id: '11', img: 'assets/img/structure/11.png', priority: 1, type: '' },
        ]; */
    }

    loadElements() {
        const that = this;
        /*var elements = [
            { id: '1', img: 'assets/img/elements/1.png', priority: 1, type: 'umbrella' },
            { id: '2', img: 'assets/img/elements/2.png', priority: 1, type: 'umbrella' },
            { id: '3', img: 'assets/img/elements/3.png', priority: 1, type: 'umbrella' },
            { id: '4', img: 'assets/img/elements/baldaquin.png', priority: 1, type: 'baldaquin' },
            { id: '5', img: 'assets/img/elements/sunbed-1.png', priority: 1, type: 'sunbed' },
            { id: '6', img: 'assets/img/elements/sunbed-2.png', priority: 1, type: 'sunbed' },
            { id: '7', img: 'assets/img/elements/sunbed-3.png', priority: 1, type: 'sunbed' },
            { id: '8', img: 'assets/img/elements/sunbed-4.png', priority: 1, type: 'sunbed' },
        ];*/


        this.assetService.getElements().then((res: any) => {
            let staticElements = [{
                id: '1',
                img: 'assets/img/elements/static/alway_0.png',
                priority: 4,
                type: 'static',
                size: { width: 120, height: 25 },
                objectType: 'alway', collide: true
            },
            {
                id: '2',
                img: 'assets/img/elements/static/alway_1.png',
                priority: 4,
                type: 'static',
                size: { width: 25, height: 120 },
                objectType: 'alway', collide: true
            },
            {
                id: '3',
                img: 'assets/img/elements/static/alway_2.png',
                priority: 4,
                type: 'static',
                size: { width: 120, height: 120 },
                objectType: 'alway', collide: true
            },
            {
                id: '4',
                img: 'assets/img/elements/static/alway_3.png',
                priority: 4,
                type: 'static',
                size: { width: 120, height: 120 },
                objectType: 'alway',
                collide: true
            },
            {
                id: '5',
                img: 'assets/img/elements/static/alway_4.png',
                priority: 4,
                type: 'static',
                size: { width: 120, height: 95 },
                objectType: 'alway',
                collide: true
            },
            {
                id: '6',
                img: 'assets/img/elements/static/alway_5.png',
                priority: 4,
                type: 'static',
                size: { width: 120, height: 95 },
                objectType: 'alway',
                collide: true
            },
            { id: '7', img: 'assets/img/elements/static/alway_6.png', priority: 4, type: 'static', size: { width: 95, height: 120 }, objectType: 'alway', collide: true },
            { id: '8', img: 'assets/img/elements/static/alway_7.png', priority: 4, type: 'static', size: { width: 95, height: 120 }, objectType: 'alway', collide: true },
            { id: '9', img: 'assets/img/elements/static/bar.png', priority: 4, type: 'static', size: { width: 180, height: 120 }, objectType: 'other' },
            { id: '10', img: 'assets/img/elements/static/cabin_change.png', priority: 4, type: 'static', size: { width: 224, height: 120 }, objectType: 'other' },
            { id: '11', img: 'assets/img/elements/static/info_office.png', priority: 4, type: 'static', size: { width: 224, height: 120 }, objectType: 'other' },
            { id: '12', img: 'assets/img/elements/static/toilet.png', priority: 4, type: 'static', size: { width: 224, height: 120 }, objectType: 'other' },
            { id: '13', img: 'assets/img/elements/static/tree.png', priority: 4, type: 'static', size: { width: 100, height: 100 }, objectType: 'other', collide: true },
            { id: '14', img: 'assets/img/elements/static/untitled.png', priority: 4, type: 'static', size: { width: 320, height: 220 }, objectType: 'other' }];
            var elements = res.concat(staticElements);
            this.elements = res;
            that.umbrellas = elements.filter(item => {
                return item.type == 'umbrella';
            });
            that.baldaquins = elements.filter(item => {
                return item.type == 'baldaquin';
            });
            that.sunbeds = elements.filter(item => {
                return item.type == 'sunbed';
            });
            that.staticElements = elements.filter(item => {
                if (item.type == 'static') {
                    item.b64 = item.img;
                    item.image = item.img;
                    return true;
                }
                return false;
            });
            that.loadBeachElements();

        });

    }

    loadSavedElements() {
        this.editList = [{
        }];
        this.isValidUmbrella();
    }

    ngOnInit() {
        var mappanel = document.getElementById("mappanel");
        var iniWidth = mappanel.clientWidth;
        var iniHeight = mappanel.clientHeight;

        var defaults = {
            line: [10, 10, "#fff"], // x step, y step, color
            redline: [200, 400, 0], // y1, y2
            gridtext: [100, 300, 500],
            gridres: [1600, 600],
            firstElementposition: [15, 40]
        };
        var maxWidth = defaults.gridres[0] * 5;
        var maxHeight = defaults.gridres[1] * 5;
        //var align = 25;
        var nearDis = 120;
        var zoomText = 100;
        var currentScale = 1;
        var zoomScale = 1;
        var gridScale = 1;
        function refreshTextPositions(result) {

            if (result.areaY[0] <= 30) {
                result.areaY[0] = 30;
                result.redline[0].setY(result.areaY[0]);
            }
            if (result.areaY[1] <= 60) {
                result.areaY[1] = 60;
                result.redline[1].setY(result.areaY[1]);
            }
            let front = result.gridtext[0],
                middle = result.gridtext[1],
                back = result.gridtext[2],
                centerPos = function (p1, p2 = 0) {
                    return (p1 + p2) / 2 - 8;
                },
                frontY = centerPos(result.redline[0].attrs.y),
                middleY = centerPos(result.redline[0].attrs.y, result.redline[1].attrs.y),
                backY = centerPos(result.redline[1].attrs.y, result.redline[1].attrs.y + (result.redline[1].attrs.y - result.redline[0].attrs.y));
            if (!configurationComponent.editing) {
                front.setX(-100);
                middle.setX(-100),
                    back.setX(-100);
            } else {
                front.setX(20);
                middle.setX(20),
                    back.setX(20);
                front.setY(frontY);
                middle.setY(middleY),
                    back.setY(backY);
            }
            result.layer.draw();

        }
        const basic_map = op => {
            var result = {
                stage: null,
                layer: new Konva.Layer(),
                linex: {},
                liney: {},
                redline: {},
                gridtext: {

                },
                blueline: {},
                tool: [],
                max: [0, 0],
                areaY: [200, 400],
                Json: {
                    front: [],
                    middle: [],
                    back: []
                }
            };
            /* ===    === == create stage ===    === =*/
            result.stage = new Konva.Stage({
                container: "mappanel",
                width: maxWidth, //mappanel.clientWidth,
                height: maxHeight //mappanel.clientHeight
            });




            this.createContainer = function (op) {
                let gridTexts = ["front", "middle", "back"];
                for (let i = 0; i < op.gridtext.length; i++) {

                    result.gridtext[i] = new Konva.Text({
                        x: 20,
                        y: op.gridtext[i] - 20,
                        z: 10,
                        zIndex: 100,
                        width: 200,
                        align: "left",
                        text: gridTexts[i],
                        fontSize: 16,
                        fill: "black",
                        opacity: 0.2,
                        fontStyle: "bold"
                    });
                    result.layer.add(result.gridtext[i]);
                    result.layer.draw();
                }
                /* ===    === == create two redlines ===    === =*/
                for (var i = 0; i < op.redline.length; i++) {
                    if (op.redline[i]) {
                        result.redline[i] = new Konva.Line({
                            x: 0,
                            y: op.redline[i],
                            points: [0, 0, maxWidth, 0],
                            stroke: "red",
                            strokeWidth: 4 / currentScale,
                            lineCap: "round",
                            lineJoin: "round",
                            draggable: true,
                            dragBoundFunc: function (pos) {
                                return {
                                    x: this.getAbsolutePosition().x,
                                    y: pos.y
                                };
                            },
                            id: "redline" + i
                        });
                    } else {
                        result.redline[i] = new Konva.Line({
                            x: 0,
                            y: op.redline[i],
                            points: [0, 0, maxWidth, 0],
                            stroke: "gray",
                            strokeWidth: 1, // 4 / currentScale,
                            lineCap: "round",
                            lineJoin: "round",
                            draggable: false,
                            dragBoundFunc: function (pos) {
                                return {
                                    x: this.getAbsolutePosition().x,
                                    y: pos.y
                                };
                            },
                            id: "redline" + i
                        });
                    }

                    //result.redline[i].dash([10, 5]);
                    result.redline[i].on("click", function () {
                        //this.strokeWidth(5);
                        if (!configurationComponent.editing) return;
                        result.layer.draw();
                    });
                    result.redline[i].on("mouseenter", function () {
                        //this.strokeWidth(5);
                        if (!configurationComponent.editing) return;
                        result.stage.container().style.cursor = "row-resize";
                        result.layer.draw();
                    });

                    result.redline[i].on("mouseleave", function () {
                        //this.strokeWidth(4);
                        if (!configurationComponent.editing) return;
                        result.stage.container().style.cursor = "default";
                        result.layer.draw();
                    });
                    result.redline[i].on("dragmove", function () {

                        if (!configurationComponent.editing) return;
                        result.areaY[this.attrs.id.replace("redline", "")] = this.attrs.y;
                        if (this.attrs.id.replace("redline", "") === 0) {
                            if (result.areaY[0] <= 10) {
                                result.areaY[0] = 10;
                                result.redline[0].setY(result.areaY[0]);
                            }
                            if (result.areaY[0] >= result.areaY[1] - 30) {
                                result.areaY[0] = result.areaY[1] - 30;
                                result.redline[0].setY(result.areaY[0]);
                            }
                        } else {
                            if (
                                result.areaY[1] >=
                                mappanel.clientHeight / currentScale - 10
                            ) {
                                result.areaY[1] = mappanel.clientHeight / currentScale - 10;
                                result.redline[1].setY(result.areaY[1]);
                            }

                            if (result.areaY[1] <= result.areaY[0] + 30) {
                                result.areaY[1] = result.areaY[0] + 30;
                                result.redline[1].setY(result.areaY[1]);
                                result.redline[1].setY(result.areaY[1]);
                            }
                        }
                        // result.gridtext[i].setY(result.redline[i].attrs.y);
                        refreshTextPositions(result);
                    });
                    result.redline[i].on("dragend", function () {
                        result.layer.draw();
                        if (!configurationComponent.editing) return;
                        //this.moveToTop();
                        //placeDiv(result);
                        refreshTextPositions(result);
                        configurationComponent.modified();
                    });
                    result.layer.add(result.redline[i]);
                    result.layer.draw();
                }


                result.stage.add(result.layer);

            };

            this.createContainer(defaults);

            this.beachService
                .getBeachGrid()
                .then(beach_grid => {
                    this.beach_grid = beach_grid;
                })
                .catch(error => {
                    this.beach_grid = false;
                });
            return result;
        };

        let basic = basic_map(false),
            dragComp,
            interscet;

        document.getElementById("toolpanel").addEventListener(
            "mousedown",
            function (e: any) {
                if (!configurationComponent.editing) return;
                let knownTypes = ["umbrella-2", "umbrella-4", "baldaquin"];
                let el_id = e.target.id;
                if (el_id && el_id.search("drag-comb-") > -1) {
                    dragComp = e;
                    imageDrag();
                } else if (knownTypes.indexOf(e.target.id) >= 0) {
                    dragComp = e;
                    imageDrag();
                } else {

                }
            },
            false
        );
        function getElementWidth(element) {
            let width;
            if (element.type == 'baldaquin') {
                width = element.size.width;
            } else if (element.type == 'static') {
                width = element.size.width;
            } else {
                width = element.seatGridWidth;
            }

            return width;
        }
        function getShapeWidth(shape) {
            let width;
            try {
                width = shape.getWidth();
            } catch (e) {

            }
            return width;
        }
        function handleDragOver(e) {
            if (!configurationComponent.editing) return;
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = "copy";
            return false;
        }
        function handleDragEnter(e) {
            if (!configurationComponent.editing) return;
            this.classList.add("over");
        }
        function handleDragLeave(e) {
            if (!configurationComponent.editing) return;
            this.classList.remove("over");
        }
        function handleDrop(e) {

            if (!configurationComponent.editing) return;
            if (e.stopPropagation) {
                e.stopPropagation();
            }

            var x = e.layerX - dragComp.offsetX,
                y = e.layerY - dragComp.offsetY,
                index = 0;
            Object.keys(configurationComponent.seatNumberArray).forEach(item => {
                if (configurationComponent.seatNumberArray[item]) {
                    const current = parseInt(item) || 0;
                    index = Math.max(index, current);
                }
            });

            if (isGridSide(x, y)) {
                let x = 5,
                    y = 5;

                if (configurationComponent.last_seat) {
                    try {
                        x = configurationComponent.last_seat.attrs.x + getElementWidth(configurationComponent.last_seat.attrs.element);
                    } catch (e) {
                        x = configurationComponent.last_seat.attrs.x + 84;
                    }

                    y = configurationComponent.last_seat.attrs.y;
                }
                let _grid = {
                    front: basic.stage.find(".front"),
                    middle: basic.stage.find(".middle"),
                    back: basic.stage.find(".back")
                };

                let gridItemCount = basic.stage.find(".front").length + basic.stage.find(".middle").length + basic.stage.find(".back").length;
                if (!gridItemCount) {
                    //  x = 5, y = 5;
                }
                let ids = dragComp.target.id.split("-");
                let eleIndex = ids[ids.length - 1] - 1;
                let isStatic = (dragComp.target.id.search('static') > -1) ? true : false;
                let params: any = {
                    x, y, src: dragComp.target.src,
                    id: dragComp.target.id,
                    imageWidth, imageHeight,
                    mapElementIndex: eleIndex,
                    mapElement: undefined,
                    staticElement: isStatic,
                    index: index + 1
                },
                    mapEle = isStatic ? configurationComponent.staticElements[eleIndex] : configurationComponent.savedCombinations[eleIndex];
                params.mapElement = mapEle;
                if (mapEle.type == 'static') {
                    params.index = -1;
                }
                if (!params.src) {
                    params.src = params.mapElement.src;
                }
                params.detectCollision=true;
                if (params.mapElement) {
                    addImageOnMap(params);
                } else {
                    addImageToMap(
                        x,
                        y,
                        dragComp.target.src,
                        dragComp.target.id,
                        imageWidth,
                        imageHeight,
                        `${index + 1}`
                    );
                }

            }
            return false;
        }
        function isGridSide(x, y) {
            return (
                x > 0 &&
                y > 0 &&
                x + imageWidth < mappanel.clientWidth / currentScale &&
                y + imageHeight < mappanel.clientHeight / currentScale
            );
        }
        function samePoints(points1, points2) {
            for (let i = 0; i < 4; i++) {
                if (points1[i] != points2[i]) {
                    return false;
                }
            }
            return true;
        }
        function getSizeByRatio(params) {
            let { width, height, seatGridWidth } = params;
            let ratio = configurationComponent.gridScaleRatio * 100;
            width = width / 100 * ratio;
            height = height / 100 * ratio;
            if (seatGridWidth) {
                seatGridWidth = seatGridWidth / 100 * ratio;
            }
            return {
                width, height, seatGridWidth
            };
        }
        function addImageOnMap(params) {
            let { x, y, src,
                id,
                item,
                imageWidth, imageHeight,
                mapElementIndex,
                mapElement,
                index } = params;
            let redraw = (typeof (params.redraw) == 'undefined') ? true : params.redraw;
            let number = params.number || index;

            // Get Object size
            let width = mapElement.size.width,
                height = mapElement.size.height;

            if (mapElement.type == 'baldaquin' && !(mapElement.size && mapElement.size.adjusted)) {
                let pixelPer = 1.1;
                let widthPercentageGrid = mapElement.widthPercentageGrid;
                width = widthPercentageGrid * pixelPer;
                mapElement.size.width = width;
            }
            if (!mapElement.size.adjusted) {

                let sizeRatio = getSizeByRatio({ width, height, seatGridWidth: mapElement.seatGridWidth });
                height = sizeRatio.height,
                    width = sizeRatio.width;
                mapElement.size.height = height;
                mapElement.size.width = width;
                mapElement.size.adjusted = true;
                if (sizeRatio.seatGridWidth) {
                    mapElement.seatGridWidth = sizeRatio.seatGridWidth;
                }
            }

            let rPoints1 = [], rPoints2 = [];
            rPoints1 = [x, x + width, y, y + height, false];
            let infiniteLoopPrevent = 0;
            while (params.detectCollision && infiniteLoopPrevent++ < 10 && !samePoints(rPoints1, rPoints2)) {

                rPoints1 = [x, x + width, y, y + height, false];
                rPoints2 = collisionDetect([].concat(rPoints1));
                x = rPoints2[0];
                // y = rPoints2[2];
            }
            if (x < 0 || y < 0) {
                x = 5; y = 5;
            }


            if (rPoints1[0] == rPoints2[0] && rPoints1[2] == rPoints2[2]) {

            } else if (infiniteLoopPrevent >= 9) {

            }

            var imageObj = new Image();
            imageObj.onload = function () {
                if (isNaN(width) || isNaN(height) || isNaN(x) || isNaN(y)) {

                }
                var insetImage = new Konva.Group({
                    x: (x < 5) ? 5 : x,
                    y: (y < 5) ? 5 : y,
                    width: width + 4,
                    height: height + 4,
                    draggable: true,
                    id: mapElementIndex, //+i
                    name: mapElement.type + "_img_" + mapElementIndex,
                    element: mapElement,
                    info: {
                        mapElement, mapElementIndex, index
                    },
                    item
                });

                var image = new Konva.Image({
                    x: 2,
                    y: 2,
                    image: imageObj,
                    width: width,
                    height: height,
                });

                insetImage.add(image);
                if (!params.staticElement) {
                    var text = new Konva.Text({
                        x: 0,
                        y: height - 20,
                        width: width,
                        align: "left",
                        text: number,
                        stroke: "white",
                        strokeWidth: 1,
                        fontSize: 24,
                        fill: "black",
                        fontStyle: "bold"
                    });
                    insetImage.add(text);
                } else {
                    // Static Elements

                }


                insetImage.setAttrs({
                    seat_number: index
                });
                configurationComponent.seatNumberArray[index] = true;

                insetImage.on("dragmove", function (e) {
                    if (configurationComponent.lastPos.id != this._id) {
                        configurationComponent.lastPos.id = this._id;
                        configurationComponent.lastPos.x = this.attrs.x;
                        configurationComponent.lastPos.y = this.attrs.y;
                    }
                    if (!configurationComponent.editing) return;
                    for (var i = 0; i < 100; i++) {
                        this.setAttrs({ myone: "myone" });
                        this.setAttrs({
                            x: collisionDetect(getRectpoint(this))[0],
                            y: collisionDetect(getRectpoint(this))[2],
                            myone: ""
                        });
                        if (interscet) break;
                    }
                    basic.layer.draw();
                });
                insetImage.on("dblclick", function (e) {
                    let that = this;
                    swal({
                        title: 'Are you sure to delete this seat?',
                        text: "You won't be able to revert this!",
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, delete it!',
                        cancelButtonText: 'No, cancel!',
                        reverseButtons: true
                    }).then((result) => {

                        if (that.attrs.item) {
                            if (that.attrs.item.index > -1 && configurationComponent.bookings.indexOf(that.attrs.item.index) > -1) {
                                swal({
                                    type: 'error',
                                    title: 'Access Denied.',
                                    text: 'One or more active reservations found on this seat.',
                                });
                                return;
                            }
                        }
                        configurationComponent.seatNumberArray[
                            that.attrs.seat_number
                        ] = false;
                        that.setAttrs({ name: "" });
                        that.destroy();
                        configurationComponent.detectLastComponent();
                        basic.layer.draw();
                    }).catch((result) => {
                    });
                });
                insetImage.on("dragend", function (e) {
                    var deleteCheck = function (attrs) {
                        if (!attrs.item) {
                            return true;
                        }

                        return false;
                    }
                    if (!configurationComponent.editing) return;
                    configurationComponent.modified();
                    if (basic.max[0] > 0) {
                        if (
                            this.attrs.x < 0 ||
                            this.attrs.x > basic.max[0] - this.attrs.width ||
                            this.attrs.y < 0 ||
                            this.attrs.y > basic.max[1] - this.attrs.height
                        ) {
                            configurationComponent.seatNumberArray[
                                this.attrs.seat_number
                            ] = false;
                            this.setAttrs({ name: "" });
                            this.destroy();
                            configurationComponent.detectLastComponent();
                            basic.layer.draw();
                            return;
                        }
                    } else {
                        if (
                            this.attrs.x < 0 ||
                            this.attrs.x >
                            mappanel.clientWidth / currentScale - this.attrs.width ||
                            this.attrs.y < 0 ||
                            this.attrs.y >
                            mappanel.clientHeight / currentScale - this.attrs.height
                        ) {

                            if (!deleteCheck(this.attrs)) {
                                let lastPos = configurationComponent.lastPos;
                                this.setAttrs({
                                    x: 100,
                                    y: 100,
                                    myone: ""
                                });

                                basic.layer.draw();
                                return;
                            }

                            configurationComponent.seatNumberArray[
                                this.attrs.seat_number
                            ] = false;
                            this.setAttrs({ name: "" });
                            this.destroy();
                            configurationComponent.detectLastComponent();
                            basic.layer.draw();
                            return;
                        }
                    }
                    if (this.attrs.y > basic.areaY[1]) {
                        this.setAttrs({ name: "back" });
                    } else if (this.attrs.y > basic.areaY[0]) {
                        this.setAttrs({ name: "middle" });
                    } else {
                        this.setAttrs({ name: "front" });
                    }
                    configurationComponent.last_seat = this;
                });
                basic.tool.push(insetImage);
                basic.layer.add(insetImage);
                if (redraw) basic.layer.draw();
                // insetImage.tween = new Konva.Tween({
                //     node: insetImage,
                //     strokeWidth: 3,
                //     easing: Konva.Easings.EaseOut,
                //     duration: 1
                // });
                // insetImage.tween.play();
                // setTimeout(function() {
                //     insetImage.tween.reverse();
                // }, 500);
                configurationComponent.last_seat = insetImage;
                configurationComponent.modified();
            };
            imageObj.src = src;
        }
        function addImageToMap(x, y, src, type, width, height, index, redraw: boolean = true) {
            var imageObj = new Image();
            imageObj.onload = function () {
                var insetImage = new Konva.Group({
                    x: x,
                    y: y,
                    width: width + 4,
                    height: height + 4,
                    draggable: true,
                    id: type, //+i
                    name: src + "_img"
                });

                var image = new Konva.Image({
                    x: 2,
                    y: 2,
                    image: imageObj,
                    width: width,
                    height: height,
                });
                var text = new Konva.Text({
                    x: 0,
                    y: height - 20,
                    width: width,
                    align: "left",
                    text: index,
                    stroke: "white",
                    strokeWidth: 1,
                    fontSize: 24,
                    fill: "black",
                    fontStyle: "bold"
                });
                insetImage.add(image);
                insetImage.add(text);
                insetImage.setAttrs({
                    seat_number: index
                });
                configurationComponent.seatNumberArray[index] = true;

                insetImage.on("dragmove", function (e) {
                    if (!configurationComponent.editing) return;
                    for (var i = 0; i < 100; i++) {
                        this.setAttrs({ myone: "myone" });
                        this.setAttrs({
                            x: collisionDetect(getRectpoint(this))[0],
                            y: collisionDetect(getRectpoint(this))[2],
                            myone: ""
                        });
                        if (interscet) break;
                    }
                    basic.layer.draw();
                });
                insetImage.on("dragend", function () {
                    if (!configurationComponent.editing) return;
                    configurationComponent.modified();
                    if (basic.max[0] > 0) {
                        if (
                            this.attrs.x < 0 ||
                            this.attrs.x > basic.max[0] - this.attrs.width ||
                            this.attrs.y < 0 ||
                            this.attrs.y > basic.max[1] - this.attrs.height
                        ) {
                            configurationComponent.seatNumberArray[
                                this.attrs.seat_number
                            ] = false;
                            this.setAttrs({ name: "" });
                            this.destroy();
                            configurationComponent.detectLastComponent();
                            basic.layer.draw();
                            return;
                        }
                    } else {
                        if (
                            this.attrs.x < 0 ||
                            this.attrs.x >
                            mappanel.clientWidth / currentScale - this.attrs.width ||
                            this.attrs.y < 0 ||
                            this.attrs.y >
                            mappanel.clientHeight / currentScale - this.attrs.height
                        ) {
                            configurationComponent.seatNumberArray[
                                this.attrs.seat_number
                            ] = false;
                            this.setAttrs({ name: "" });
                            this.destroy();
                            configurationComponent.detectLastComponent();
                            basic.layer.draw();
                            return;
                        }
                    }
                    if (this.attrs.y > basic.areaY[1]) {
                        this.setAttrs({ name: "back" });
                    } else if (this.attrs.y > basic.areaY[0]) {
                        this.setAttrs({ name: "middle" });
                    } else {
                        this.setAttrs({ name: "front" });
                    }
                    configurationComponent.last_seat = this;
                });
                basic.tool.push(insetImage);
                basic.layer.add(insetImage);
                if (redraw) basic.layer.draw();
                // insetImage.tween = new Konva.Tween({
                //     node: insetImage,
                //     strokeWidth: 3,
                //     easing: Konva.Easings.EaseOut,
                //     duration: 1
                // });
                // insetImage.tween.play();
                // setTimeout(function() {
                //     insetImage.tween.reverse();
                // }, 500);
                configurationComponent.last_seat = insetImage;
                configurationComponent.modified();
            };
            imageObj.src = src;
        }

        function getRectpoint(shape) {
            var coordinate = [];
            coordinate[0] = shape.getX();
            try {
                if (shape.attrs.element.type == 'baldaquin') {
                    coordinate[1] = shape.getX() + shape.attrs.element.size.width;
                } else if (shape.attrs.element.type == 'static') {
                    coordinate[1] = shape.getX() + shape.attrs.element.size.width;
                } else {
                    coordinate[1] = shape.getX() + shape.attrs.element.size.width; // shape.attrs.element.seatGridWidth;
                }
            } catch (e) {
                coordinate[1] = shape.getX() + shape.getWidth();
            }
            coordinate[2] = shape.getY();
            coordinate[3] = shape.getY() + shape.getHeight();
            coordinate[4] = false;
            if (shape.attrs.element.collide) {
                coordinate[5] = true;
            }
            return coordinate;
        }
        var positionUpdate = [];
        function collisionDetect(main) {
            
            if (main[0] < 5) {
                main[0] = 5
            }
            if (main[1] < 5) {
                main[1] = 5
            }
            if (main[2] < 5) {
                main[2] = 5
            }
            if (main[3] < 5) {
                main[3] = 5
            }
            
            var mainRectpoint = main;
            for (var i = 0; i < basic.tool.length; i++) {
                if (main[5] && basic.tool[i].attrs.element.type == 'static' && basic.tool[i].attrs.element.collide) {
                    continue;
                }
                if (
                    basic.tool[i].attrs.myone !== "myone" &&
                    basic.tool[i].getName() !== ""
                ) {
                    var targetRectpoint = getRectpoint(basic.tool[i]);
                    if (
                        mainRectpoint[2] <= targetRectpoint[3] &&
                        mainRectpoint[3] >= targetRectpoint[2] &&
                        mainRectpoint[0] <= targetRectpoint[1] &&
                        mainRectpoint[1] >= targetRectpoint[0]
                    ) {
                        mainRectpoint[0] = targetRectpoint[1];
                        positionUpdate.push(mainRectpoint[0]);
                    } else {
                        if (mainRectpoint[4]) continue;
                        if (
                            (mainRectpoint[3] - targetRectpoint[3]) *
                            (mainRectpoint[3] - targetRectpoint[3]) <
                            nearDis &&
                            mainRectpoint[3] !== targetRectpoint[3]
                        ) {
                            mainRectpoint[2] =
                                targetRectpoint[3] + mainRectpoint[2] - mainRectpoint[3];
                            mainRectpoint[3] = targetRectpoint[3];
                            if (
                                (mainRectpoint[0] - targetRectpoint[1]) *
                                (mainRectpoint[0] - targetRectpoint[1]) <
                                nearDis
                            ) {
                                mainRectpoint[0] = targetRectpoint[1] + 10;
                            }
                        }
                        if (
                            (mainRectpoint[0] - targetRectpoint[0]) *
                            (mainRectpoint[0] - targetRectpoint[0]) <
                            nearDis &&
                            mainRectpoint[0] !== targetRectpoint[0]
                        ) {
                            mainRectpoint[0] = targetRectpoint[0];
                            if (
                                (mainRectpoint[2] - targetRectpoint[3]) *
                                (mainRectpoint[2] - targetRectpoint[3]) <
                                nearDis
                            ) {
                                mainRectpoint[2] = targetRectpoint[3] + 10;
                            }
                        }
                    }
                }
            }
            if (positionUpdate.length === 0) interscet = true;
            else {
                interscet = false;
                var max = positionUpdate.reduce(function (a, b) {
                    return Math.max(a, b);
                });
                mainRectpoint[0] = max;
                positionUpdate = [];
            }
            return mainRectpoint;
        }
        function intersection(x1, x2, y1, y2, currentScale) {
            if (
                x1 > 0 &&
                y1 > 0 &&
                x2 < mappanel.clientWidth / currentScale &&
                y2 < mappanel.clientHeight / currentScale &&
                ((basic.max[0] > 0 &&
                    x1 < (basic.max[0] - x2 + x1) * currentScale &&
                    y1 < (basic.max[1] - y2 + y1) * currentScale) ||
                    basic.max[0] === 0)
            ) {
                if (basic.tool.length === 0) {
                    return defaults.firstElementposition;
                }
                for (var i = 0; i < basic.tool.length; i++) {
                    if (basic.tool[i].getName() !== "") {
                        var targetRectpoint = getRectpoint(basic.tool[i]);
                        if (
                            (x1 - targetRectpoint[1]) * (x1 - targetRectpoint[1]) +
                            (y2 - targetRectpoint[3]) * (y2 - targetRectpoint[3]) <
                            nearDis * 3
                        ) {
                            x1 = targetRectpoint[1] + 10;
                            y1 = targetRectpoint[3] + y1 - y2;
                            return [x1, y1];
                        } else if (
                            (x1 - targetRectpoint[0]) * (x1 - targetRectpoint[0]) +
                            (y1 - targetRectpoint[3]) * (y1 - targetRectpoint[3]) <
                            nearDis * 3
                        ) {
                            x1 = targetRectpoint[0];
                            y1 = targetRectpoint[3] + 10;
                            return [x1, y1];
                        }
                    }
                }
                for (var i = basic.tool.length - 1; i >= 0; i--) {
                    var targetRectpoint = getRectpoint(basic.tool[i]);
                    if (basic.tool[i].getName() !== "") {
                        if (targetRectpoint[1] + x2 - x1 < mappanel.clientWidth - 20) {
                            if (
                                Math.abs(x1) < Math.abs(y1 - targetRectpoint[2]) ||
                                x1 < targetRectpoint[0]
                            ) {
                                for (var j = 0; j < 3; j++) {
                                    if (basic.tool[j].getName() !== "") {
                                        var firsteleY = getRectpoint(basic.tool[j]);
                                        if (basic.tool[j].getX() < 60) {
                                            x1 = firsteleY[0];
                                            return [x1, y1];
                                        }
                                        for (var t = i; t >= 0; t--) {
                                            if (basic.tool[t].getName() !== "") {
                                                if (
                                                    basic.tool[t].getY() + basic.tool[t].getHeight() !==
                                                    targetRectpoint[3]
                                                ) {
                                                    x1 = basic.tool[t + 1].getX();
                                                    y1 = targetRectpoint[3] + 10;
                                                    return [x1, y1];
                                                }
                                            } else if (t === 0) {
                                                x1 = firsteleY[0];
                                                y1 = targetRectpoint[3] + 10;
                                                return [x1, y1];
                                            }
                                        }
                                        x1 = firsteleY[0];
                                        y1 = targetRectpoint[3] + 10;
                                        return [x1, y1];
                                    }
                                }
                            } else {
                                x1 = targetRectpoint[1] + 10;
                                y1 = targetRectpoint[3] + y1 - y2;
                                return [x1, y1];
                            }
                        } else {
                            for (var j = 0; j < 3; j++) {
                                if (basic.tool[j].getName() !== "") {
                                    var firsteleY = getRectpoint(basic.tool[j]);
                                    x1 = firsteleY[0];
                                    y1 = firsteleY[3] + 10;
                                    return [x1, y1];
                                }
                            }
                        }
                        return [x1, y1];
                    }
                }
                return [x1, y1];
            } else {
                return null;
            }
        }

        function imageDrag() {
            var canvasContainer = document.getElementById("mappanel");
            canvasContainer.addEventListener("dragenter", handleDragEnter, false);
            canvasContainer.addEventListener("dragover", handleDragOver, false);
            canvasContainer.addEventListener("dragleave", handleDragLeave, false);
            canvasContainer.addEventListener("drop", handleDrop, false);
        }
        function generateJSON() {
            if (trimFlag) trim_view(); //{alert("Please Trim the map."); return;}
            for (var i = 0; i < basic.tool.length; i++) {
                if (basic.tool[i].getName() !== "") {
                    if (basic.tool[i].attrs.y > basic.areaY[1])
                        basic.tool[i].setAttrs({ name: "back" });
                    else if (basic.tool[i].attrs.y > basic.areaY[0])
                        basic.tool[i].setAttrs({ name: "middle" });
                    else basic.tool[i].setAttrs({ name: "front" });
                }
            }
            //{"grid_settings":{"max_y":150,"max_x":300},
            window['basic'] = basic;
            basic.Json = { front: [], middle: [], back: [] };
            let priceTypes = ["umbrella-4", "umbrella-2", "baldaquin"];
            let priceValue = ["umbrella", "umbrella", "baldaquin"];
            var front = basic.stage.find(".front");
            var middle = basic.stage.find(".middle");
            var back = basic.stage.find(".back");
            var sortingMethod = function (a, b) {
                if (a.attrs.y + a.attrs.height === b.attrs.y + b.attrs.height)
                    return a.attrs.x + a.attrs.width - (b.attrs.x + b.attrs.width);
                else
                    return (
                        (a.attrs.y + a.attrs.height - (b.attrs.y + b.attrs.height)) * 1600
                    );
            };

            var array;
            front.sort(sortingMethod);
            middle.sort(sortingMethod);
            back.sort(sortingMethod);
            let structure = {
                front, middle, back
            },
                sides = ['front', 'middle', 'back']; // Object.keys(structure);
            let newStructure = {
                front: [],
                middle: [],
                back: []
            };
            let newList = [], no = 1, index = 0, userNumber = [], usedIndex = [], itemId = 0 + configurationComponent.idOffset;
           
            try {
                let oldGrid = {
                    front, middle, back
                };
                Object.keys(oldGrid).map((zone) => {
                    let seatList = oldGrid[zone];
                    seatList.map((seat) => {
                        let attrs = seat.attrs;
                        if (attrs.item) {
                            attrs.info.i = attrs.item.info.i;
                            attrs.info.old_id = attrs.item.info.old_id;
                            if (usedIndex.indexOf(attrs.item.index) == -1) {
                                usedIndex.push(attrs.item.index);
                            }
                            if (attrs.info.i > itemId) {
                                itemId = attrs.info.i;
                            }
                            userNumber.push(attrs.item.number);
                            if (attrs.item.number > no) {
                                no = attrs.item.number;
                            }
                        }

                    });
                });

            } catch (e) {

            }
            itemId++;

            try {
                for (let h = 0; h < sides.length; h++) {
                    let side = sides[h];
                    let list = structure[side];
                    for (let i = 0; i < list.length; i++) {
                        try {
                            const li = list[i],
                                attrs = li.attrs,
                                el = Object.assign({}, attrs.element),
                                element = el.element || {},
                                elementType = el.type,
                                structure = el.structure || {},
                                seat = structure.seat || {},
                                seatSides = Object.keys(seat),
                                oldElement = (attrs.item) ? true : false,
                                oldItem = (oldElement) ? attrs.item : '',
                                oldElementIndex = (oldElement) ? (attrs.item.index) : -1,
                                oldElementNumber = (oldElement) ? (attrs.item.number) : 0,
                                oldElementId = (oldElement) ? (attrs.item.i || -1) : -1;

                            let seatStatus = [],
                                seats = 0;
                            for (let j = 0; j < seatSides.length; j++) {
                                seatStatus = seatStatus.concat(seat[seatSides[j]]);
                            }
                            // seats = seatStatus.length;
                            let seatConfig = {
                                m: 1,
                                n: 2,
                                o: 4,
                                x: 2,
                                y: 3,
                                z: 4
                            };
                            if (elementType == 'baldaquin') {

                            } else if (elementType == 'umbrella') {

                            }
                            for (let j = 0; j < seatSides.length; j++) {
                                let sName = seatSides[j], val = seatConfig[sName] || 1;
                                seats = seats + val;
                            }
                            let combId = "",
                                getCombinationId = function () {
                                    let doMerge = function (a, b) {
                                        if (a && b) {
                                            return a + '__' + b;
                                        } else if (a || b) {
                                            return a || b;
                                        } else {
                                            return '';
                                        }
                                    };
                                    combId = doMerge(combId, elementType);
                                    combId = doMerge(combId, el.objectType);
                                    combId = doMerge(combId, structure.id);
                                    if (element.umbrella) {
                                        combId = doMerge(combId, element.umbrella.id);
                                    }
                                    if (element.sunbed) {
                                        combId = doMerge(combId, element.sunbed.id);
                                    }
                                    if (element.baldaquin) {
                                        combId = doMerge(combId, element.baldaquin.id);
                                    }
                                };
                            getCombinationId();
                            let getIndex = function () {
                                if (oldElement) {
                                    return oldElementIndex;
                                }
                                let index = 0;
                                while (usedIndex.indexOf(index) > -1) {
                                    index++;
                                }
                                usedIndex.push(index);
                                return index;
                            };
                            let getNumber = function () {
                                if (oldElement) {
                                    return oldElementNumber;
                                }
                                let num = 1;
                                while (userNumber.indexOf(num) > -1) {
                                    num++;
                                }
                                userNumber.push(num);
                                return num;
                            };
                            let getItemId = function () {
                                configurationComponent.idOffset = ++itemId;
                                return itemId;
                            };
                            const gridData: any = {
                                type: elementType,
                                combination_id: combId,
                                index: -1,
                                number: newList.length + 1,
                                status: seat,
                                seats,
                                sides: seatSides.length,
                                image: el.image,
                                status_icon: "",
                                coords: {
                                    x: attrs.x,
                                    y: attrs.y
                                },
                                collide: false,
                                info: attrs.info
                            };



                            if (gridData.type === 'static') {
                                gridData.index = -1;
                                gridData.number = 0;
                                if (el.collide) {
                                    gridData.collide = true;
                                }
                            } else {
                                gridData.number = getNumber();
                                gridData.index = getIndex(); // index++                               
                                newList.push(gridData);
                            }

                            /*
                                gridData.oldElement = oldElement;
                                gridData.oldElementIndex = oldElementIndex;
                                gridData.info.old_id = oldElementId; 
                            */

                            if (!oldElement) {
                                gridData.info.i = getItemId();
                            } else {
                                gridData.info.i = gridData.info.i || getItemId();
                            }

                            /*  const gridData = {
                                type: elementType,
                                el,
                                number: newList.length + 1,
                                status: seat,
                                statusClass: "11",
                                seats: seats,
                                coords: {
                                    y: gridResponsivey(front[i].attrs.y + front[i].attrs.height),
                                    x: gridResponsivex(front[i].attrs.x + front[i].attrs.width)
                                },
                                element
                            } */
                            if (!(gridData.info && gridData.info.mapElement)) {

                            }
                            gridData['i'] = gridData.info.i;
                            if (oldItem) {
                                oldItem.info['i'] = gridData['i'];
                                gridData['info'] = oldItem.info;
                            }

                            newStructure[side].push(gridData);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }

            } catch (e) {

            }
            window['grid'] = newStructure;


            basic.Json.front = newStructure.front;
            basic.Json.middle = newStructure.middle;
            basic.Json.back = newStructure.back;
        }
        document.getElementById("save").addEventListener(
            "click",
            function (e) {
                if (!configurationComponent.editing) {
                    configurationComponent.goEdit();
                    refreshTextPositions(basic);
                    return;
                }
                refreshTextPositions(basic);

                generateJSON();
                // return;
                configurationComponent.saveGridData(
                    basic.Json,
                    basic.max[0] + 10,
                    basic.max[1] + 10
                );


            },
            false
        );
        function gridResponsivex(g) {
            return g;
        }
        function gridResponsivey(g) {
            return g;
        }

        var trimFlag = true;
        var old_max = [];
        function trim_view() {
            if (basic.tool.length === 0) return;
            basic.max = [0, 0]; let x = 0, y = 0;
            let blueLineOffset = 15;
            for (var i = 0; i < basic.tool.length; i++) {
                let shape = basic.tool[i];
                if (basic.tool[i].getName() !== "") {

                    if (shape.attrs.element.type == 'baldaquin') {
                        x = shape.getX() + shape.attrs.element.size.width;
                    } else if (shape.attrs.element.type == 'static') {
                        x = shape.getX() + shape.attrs.element.size.width;
                    } else {
                        x = shape.getX() + shape.attrs.element.seatGridWidth;
                    }

                    y = basic.tool[i].attrs.y + basic.tool[i].attrs.height;
                    if (x > basic.max[0]) {
                        basic.max[0] = x;
                    }
                    if (y > basic.max[1]) {
                        basic.max[1] = y;
                    }

                }
            }
            basic.max[0] += 10;
            basic.max[1] += 5;
            if (basic.max[0] === 0) return;
            /* ===    === == create two Bluelines ===    === =*/
            basic.redline[0].hide();
            basic.redline[1].hide();
            zoomdivDisplay("none");
            blueLineremove();
            // Bottom Line
            basic.blueline[0] = new Konva.Line({
                x: 0,
                y: basic.max[1],
                points: [0, 0, basic.max[0], 0],
                stroke: "blue",
                strokeWidth: 2 / currentScale
            });
            basic.layer.add(basic.blueline[0]);
            // Right Line
            basic.blueline[1] = new Konva.Line({
                x: basic.max[0],
                y: 0,
                points: [0, 0, 0, basic.max[1]],
                stroke: "blue",
                strokeWidth: 4 / currentScale
            });
            basic.layer.add(basic.blueline[1]);
            // Left Line
            basic.blueline[2] = new Konva.Line({
                x: 0,
                y: 0,
                points: [0, 0, 0, basic.max[1]],
                stroke: "blue",
                strokeWidth: 4 / currentScale
            });
            basic.layer.add(basic.blueline[2]);
            // Top Line
            basic.blueline[3] = new Konva.Line({
                x: 0,
                y: 0,
                points: [0, 0, basic.max[0], 0],
                stroke: "blue",
                strokeWidth: 4 / currentScale
            });
            basic.layer.add(basic.blueline[3]);
            basic.layer.draw();
            setTimeout(function () {
                trim(basic.max);
                trimFlag = false;
            }, 300);
            configurationComponent.translate.get("EDIT").subscribe(res => {
                $("#save").html(res);
            });

        }
        /* }, false); */
        // blueline initialize
        function blueLineremove() {
            if (basic.blueline[0]) basic.blueline[0].destroy();
            if (basic.blueline[1]) basic.blueline[1].destroy();
            if (basic.blueline[2]) basic.blueline[2].destroy();
            if (basic.blueline[3]) basic.blueline[3].destroy();
        }
        // trim scale
        function trim(data) {
            var trimScale =
                mappanel.clientWidth / (data[0] + 12) >
                    mappanel.clientHeight / (data[1] + 12)
                    ? mappanel.clientHeight / (data[1] + 12)
                    : mappanel.clientWidth / (data[0] + 12); // 12 : margin
            zoomScale = 1;
            currentScale = zoomScale * gridScale;
            redlineFix();
            zoomText = 100;
            document.getElementById("zoomvalue").innerHTML = zoomText + "%";
            basic.stage.scale({ x: trimScale, y: trimScale });

            basic.stage.batchDraw();
        }

        zoomdivDisplay("block");
        function zoomdivDisplay(data) {
            var d = document.getElementById("zoomin");
            var e = document.getElementById("zoomout");
            var f = document.getElementById("zoomvalue");
            d.style.display = data;
            e.style.display = data;
            f.style.display = data;
        }

        function redlineFix() {
            // basic.redline[0].setAttrs({ strokeWidth: 4 / currentScale });
            // basic.redline[1].setAttrs({ strokeWidth: 4 / currentScale });
        }

        document.getElementById("zoomcontrol").addEventListener(
            "mouseup",
            function (e) {
                if (!configurationComponent.editing) return;
                configurationComponent.downFlag = true;
            },
            false
        );

        document.getElementById("zoomcontrol").addEventListener(
            "mousemove",
            function (e) {
                if (!configurationComponent.editing) return;
                if (configurationComponent.downFlag === true) {
                    if (!trimFlag) {
                        alert("This can not be active in trim state.");
                        return;
                    }
                    if (gridScale <= 0.38555) return;
                    refreshScale();
                }
            },
            false
        );
        function refreshScale() {
            gridScale = Number(configurationComponent.simpleSlider) / 10;
            currentScale = zoomScale / gridScale;
            redlineFix();
            basic.stage.scale({ x: currentScale, y: currentScale });
            basic.stage.batchDraw();
            defaults.gridres[0] = 160 * Number(configurationComponent.simpleSlider);
            defaults.gridres[1] = 90 * Number(configurationComponent.simpleSlider);

            configurationComponent.downFlag = false;
            configurationComponent.modified();
        }

        function refreshZoomScale() {
            document.getElementById("zoomvalue").innerHTML = zoomText + "%";
            var mapDiv = document.getElementById("mappanel");
            if (zoomScale > 1) {
                document.getElementById("map").style.overflow = "scroll";
            } else {
                document.getElementById("map").style.overflow = "hidden";
            }
            mapDiv.style.width = iniWidth * zoomScale + "px";
            mapDiv.style.height = iniHeight * zoomScale + "px";
            refreshScale();
        }
        document.getElementById("zoomin").addEventListener(
            "click",
            function (e) {
                if (!configurationComponent.editing) return;
                if (!trimFlag) {
                    alert("This can not be active in trim state.");
                    return;
                }
                if (zoomScale < 4) {
                    zoomScale += 0.1;
                    zoomText += 10;
                    refreshZoomScale();
                }
            },
            false
        );

        document.getElementById("zoomout").addEventListener(
            "click",
            function (e) {
                if (!configurationComponent.editing) return;
                if (!trimFlag) {
                    alert("This can not be active in trim state.");
                    return;
                }
                if (zoomScale === 1) return;
                zoomScale -= 0.1;
                zoomText -= 10;
                refreshZoomScale();
            },
            false
        );

        let imageWidth = 70,
            imageHeight = 51;
        function onGridReloaded() {

        }

        function initGrid(

            grid = { front: [], middle: [], back: [] },
            setting = { width: 1600, height: 900 }
        ) {
            window['grid'] = grid;
            if (!(configurationComponent.combinationLoaded && configurationComponent.elementsLoaded.element)) {
                setTimeout(() => {
                    initGrid(grid, setting);
                }, 100);
                return;
            }


            var xScale: number = (setting.width * 10) / $("#mappanel").width();
            var yScale: number = (setting.height * 10) / $("#mappanel").height();
            configurationComponent.simpleSlider = Math.max(xScale, yScale);
            if (configurationComponent.simpleSlider < 10)
                configurationComponent.simpleSlider = 10;

            configurationComponent.simpleSlider =
                (Math.floor(configurationComponent.simpleSlider * 10) + 1) / 10.0;

            try {
                refreshScale();
            } catch (e) {
                console.error("Refresh Scale Error", e);
            }

            const front = grid.front;
            const middle = grid.middle;
            const back = grid.back;

            if (middle.length > 0) {
                basic.areaY[0] = Math.min.apply(
                    null,
                    middle.map(item => item.coords.y - imageHeight - 10)
                );
                basic.redline[0].setY(basic.areaY[0]);
            }
            if (back.length > 0) {
                basic.areaY[1] = Math.min.apply(
                    null,
                    back.map(item => item.coords.y - imageHeight - 10)
                );
                basic.redline[1].setY(basic.areaY[1]);
            }
            basic.layer.draw();

            currentScale = zoomScale / gridScale;
            redlineFix();
            basic.stage.scale({ x: currentScale, y: currentScale });
            basic.stage.batchDraw();
            defaults.gridres[0] = 160 * Number(configurationComponent.simpleSlider);
            defaults.gridres[1] = 90 * Number(configurationComponent.simpleSlider);

            let src1, src2, src3;
            [front, middle, back].forEach((item: any) => {
                item.forEach(item => {
                    let src = "",
                        type = "";
                    if (item.type === "umbrella") {
                        if (item.seats === 2) {
                            src = src1;
                            type = "umbrella-2";
                        } else {
                            src = src2;
                            type = "umbrella-4";
                        }
                    } else {
                        src = src3;
                        type = "baldaquin";
                    }
                    let x = item.coords.x,
                        y = item.coords.y;

                    let imgSrc = item.info.mapElement.image;
                    if (item.type !== 'static') {
                        imgSrc = configurationComponent.imgPath + imgSrc;
                    }
                    imgSrc = imgSrc + "?" + configurationComponent.clearCache;
                    configurationComponent.imgPath
                    addImageOnMap({
                        x, y, src: imgSrc,
                        mapElementIndex: item.info.mapElementIndex,
                        mapElement: item.info.mapElement,
                        index: item.info.index,
                        number: item.number,
                        item,
                        staticElement: (item.type == 'static')
                    });

                    /* addImageToMap(
                        x - imageWidth,
                        y - imageHeight,
                        src,
                        type,
                        imageWidth,
                        imageHeight,
                        `${item.number}`,
                        false
                    ); */
                });
            });
            /* setTimeout(() => {
                configurationComponent.saved();
                refreshTextPositions(basic);
            }), 300; */
            setTimeout(
                function () {
                    generateJSON();
                    configurationComponent.saved();
                    configurationComponent.detectLastComponent();
                    configurationComponent.loaded = true;
                },
                1300
            );
        }
        /* function initGrid2(
        grid = { front: [], middle: [], back: [] },
        setting = { width: 1600, height: 900 }
    ) {
        let src1 = "assets/img/beach-configuration/umbrella-2.png";
        let src2 = "assets/img/beach-configuration/umbrella-4.png";
        let src3 = "assets/img/beach-configuration/baldaquin.png";

        var xScale: number = (setting.width * 10) / $("#mappanel").width();
        var yScale: number = (setting.height * 10) / $("#mappanel").height();
        configurationComponent.simpleSlider = Math.max(xScale, yScale);
        if (configurationComponent.simpleSlider < 10)
            configurationComponent.simpleSlider = 10;

        configurationComponent.simpleSlider =
            (Math.floor(configurationComponent.simpleSlider * 10) + 1) / 10.0;

        refreshScale();

        const front = grid.front;
        const middle = grid.middle;
        const back = grid.back;

        if (middle.length > 0) {
            basic.areaY[0] = Math.min.apply(
                null,
                middle.map(item => item.coords.y - imageHeight - 10)
            );
            basic.redline[0].setY(basic.areaY[0]);
        }
        if (back.length > 0) {
            basic.areaY[1] = Math.min.apply(
                null,
                back.map(item => item.coords.y - imageHeight - 10)
            );
            basic.redline[1].setY(basic.areaY[1]);
        }
        basic.layer.draw();

        currentScale = zoomScale / gridScale;
        redlineFix();
        basic.stage.scale({ x: currentScale, y: currentScale });
        basic.stage.batchDraw();
        defaults.gridres[0] = 160 * Number(configurationComponent.simpleSlider);
        defaults.gridres[1] = 90 * Number(configurationComponent.simpleSlider);
        document.getElementById("gridvalue").innerHTML =
            defaults.gridres[0] + " X " + defaults.gridres[1];
        [front, middle, back].forEach(item => {
            item.forEach(item => {
                let src = "",
                    type = "";
                if (item.type === "umbrella") {
                    if (item.seats === 2) {
                        src = src1;
                        type = "umbrella-2";
                    } else {
                        src = src2;
                        type = "umbrella-4";
                    }
                } else {
                    src = src3;
                    type = "baldaquin";
                }
                let x = item.coords.x,
                    y = item.coords.y;
                addImageToMap(
                    x - imageWidth,
                    y - imageHeight,
                    src,
                    type,
                    imageWidth,
                    imageHeight,
                    `${item.number}`,
                    false
                );
            });
        });
    } */
        this.loadBeachGrid = () => {
            let that = this;
            that.mapLoading = true;
            this.beachService
                .checkLogic(this.beachService.CHECK.BEACH_MAP)
                .then(() => {
                    return this.beachService.getBeachGrid();
                })
                .then(beach_grid => {
                    this.published = beach_grid.published;
                    basic = basic_map(false);
                    this.beach_grid = beach_grid;
                    this.bookings = beach_grid.booked_seats;
                    this.idOffset = 0;
                    Object.keys(this.beach_grid.grid).map((zone) => {
                        this.beach_grid.grid[zone].map((li) => {
                            let no = Number(li.i);
                            let number = Number(li.number);
                            this.idOffset = (no > this.idOffset) ? no : this.idOffset + 1;
                            this.noOffset = (number > this.noOffset) ? number : this.noOffset + 1;
                        });
                    });
                    this.idOffset = 0 + this.beach_grid.grid.front.length + this.beach_grid.grid.middle.length + this.beach_grid.grid.back.length;
                    initGrid(this.beach_grid.grid, this.beach_grid.grid_setting);
                    that.mapLoading = false;

                    /* if (beach_grid.published) {
                        $("#save")
                            .parent()
                            .remove();
                        $("#publish")
                            .parent()
                            .remove();
                    } */
                })
                .catch(error => {
                    if (error.type === "auth") return;
                    if (error.logicError) {
                        error.logicError.subscribe(result => {
                            swal({
                                type: "error",
                                title: "",
                                confirmButtonClass: "btn btn-info",
                                text: result,
                                buttonsStyling: false
                            })
                                .then(() => {
                                    this.router.navigateByUrl(error.url);
                                })
                                .catch(() => {
                                    this.router.navigateByUrl(error.url);
                                });
                        });
                    } else {
                        this.loaded = true;
                        $("#publish").prop("disabled", true);
                    }
                });
        };
        this.loadBeachGrid();
        this.goEdit = () => {
            if (!this.loaded) return;
            this.editing = true;
            const collections = basic.stage.find(".front,.middle,.back");
            collections.forEach(item => {
                item.setAttrs({ draggable: true });
            });
            zoomdivDisplay("block");
            this.translate.get("SAVE").subscribe(res => {
                $("#save").html(res);
            });
            basic.max = old_max;
            basic.redline[0].show();
            basic.redline[1].show();
            refreshScale();
            blueLineremove();
            trimFlag = true;
        };
        this.saved = () => {
            const collections = basic.stage.find(".front,.middle,.back");
            collections.forEach(item => {
                item.setAttrs({ draggable: false });
            });
            this.translate.get("EDIT").subscribe(res => {
                $("#save").html(res);
            });
            $("#publish").prop("disabled", false);
            this.editing = false;
            this.modifiedGrid = false;
        };

        this.detectLastComponent = (deleted?: number) => {
            if (!basic.tool || !basic.tool.length) return null;
            this.last_seat = basic.tool[0];
            for (var i = 0; i < basic.tool.length; i++) {
                if (deleted === i) continue;
                if (this.last_seat.attrs.y < basic.tool[i].attrs.y) {
                    this.last_seat = basic.tool[i];
                } else if (this.last_seat.attrs.y === basic.tool[i].attrs.y && this.last_seat.attrs.x < basic.tool[i].attrs.x) {
                    this.last_seat = basic.tool[i];
                }
            }
        };
    }
    loadBeachGrid() {
    }
    goEdit: any = false;
    saved: any = false;
    editing = true;
    modified() {
        if (!this.loaded) return;
        this.translate.get("SAVE").subscribe(res => {
            $("#save").html(res);
        });
        $("#publish").prop("disabled", true);
        $("#save").prop("disabled", false);
        this.modifiedGrid = true;
    }

    public detectLastComponent: any = () => { };
    public modifiedGrid = false;
    public editable = true;
    private loaded = false;
    restoreGrid() {
        this.loadBeachGrid();
    }
    saveGridData(grid, width, height) {
        window['grid'] = grid;
        var savePromise: any = false;
        let that = this;
        that.mapLoading = true;
        if (this.beach_grid) {
            savePromise = this.beachService.updateBeachGrid(
                this.beach_grid.id,
                grid,
                width,
                height
            );
        } else {
            savePromise = this.beachService.createBeachGrid(grid, width, height);
        }
        savePromise
            .then((resp) => {
                if (!resp.success) {
                    swal({
                        type: 'error',
                        title: 'Access Denied.',
                        text: 'One or more active reservations found on this seat.',
                    });
                    this.restoreGrid();
                    that.mapLoading = false;
                }

                return this.beachService.getBeachGrid();
            })
            .then(beach_grid => {
                this.beach_grid = beach_grid;

                if (beach_grid) {
                    this.beach_grid = beach_grid;
                }
                this.saved();
                this.loadBeachGrid();
            })
            .catch(error => {
                if (error.type === "auth") return;
                swal({
                    type: "error",
                    title: "",
                    confirmButtonClass: "btn btn-info",
                    text: error.message,
                    buttonsStyling: false
                }).catch(swal.noop);
                that.mapLoading = false;
            });
    }
    publishGrid() {
        this.beachService
            .publishBeachGrid(this.beach_grid.beach_id)
            .then(() => {
                this.published = true;
                /* $("#save")
                    .parent()
                    .remove();
                $("#publish")
                    .parent()
                    .remove(); */
                swal({
                    type: "success",
                    title: "Done",
                    confirmButtonClass: "btn btn-info",
                    text: "Beach map has been published successfully..",
                    buttonsStyling: false
                }).catch(swal.noop);
            })
            .catch(error => {
                if (error.type === "auth") return;
                swal({
                    type: "error",
                    title: "",
                    confirmButtonClass: "btn btn-info",
                    text: error.message,
                    buttonsStyling: false
                }).catch(swal.noop);
            });
    }

    allowDrop(ev) {
        ev.preventDefault();
    }

    drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    matchById(id, list) {
        for (let i = 0; i < list.length; i++) {
            const li = list[i];
            if (li.id === id) {
                return Object.assign({}, li);
            };
        }
        return null;
    }

    doDrop(ev, data) {
        var element = $('#' + data);
        var to = $(ev.target);
        var to_class = $(ev.target).attr('class');

        if (element.hasClass(to_class)) {

            if (to.is('img')) {
                to = to.parent();
            }

            to.html(element.clone());

            if (to.parent().find('.umbrella').children().length > 0 && to.parent().find('.sunbed').children().length > 0) {
                this.combinations.push({
                    umbrella: to.parent().find('.umbrella img').attr('id'), sunbed: to.parent().find('.sunbed img').attr('id')
                });

            }
        }
    }
    testStart() {
        return;
        if (this.structures.length && this.editList.length) {
            this.refreshCombinations();
        }
    }
    refreshBackUp(type = 'all', saved = false) {
        let umbrella = "",
            baldaquin = "";
        switch (type) {
            case 'structure':
                let baldaquins = this.structuresBaldaquin,
                    umbrellas = this.structuresUmbrella;
                for (let i = 0; i < baldaquins.length; i++) {
                    if (baldaquins[i].active) {
                        baldaquin += baldaquins[i].id;
                    }
                } for (let i = 0; i < umbrellas.length; i++) {
                    if (umbrellas[i].active) {
                        umbrella += umbrellas[i].id;
                    }
                }
                if (saved) {
                    this.backupStructureUmbrella = umbrella;
                    this.backupStructureBaldaquin = baldaquin;
                }
                this.structureSaved = (this.backupStructureUmbrella == umbrella && this.backupStructureBaldaquin == baldaquin) ? true : false;
                break;
            case 'umbrella':
                let editList = "";
                for (let i = 0; i < this.editList.length; i++) {
                    const li: any = this.editList[i];
                    if (li.sunbed && li.umbrella) {
                        editList += li.umbrella.id + '---' + li.sunbed.id;
                    }
                }
                if (saved) {
                    this.backupUmbrella = editList;
                }
                this.umbrellaSaved = (this.backupUmbrella == editList) ? true : false;

                break;
            case 'baldaquin':
                let backupBaldaquin = "";
                for (let i = 0; i < this.baldaquins.length; i++) {
                    const li: any = this.baldaquins[i];
                    if (li.active) {
                        backupBaldaquin += li.id;
                    }
                }
                if (saved) {
                    this.backupBaldaquin = backupBaldaquin;
                }
                this.baldaquinSaved = (this.backupBaldaquin == backupBaldaquin) ? true : false;
                break;
        }


    }
    checkGridForElements() {

        let grid = this.beach_grid.grid;
        let list = ['', 'a', 'b', 'c'];
        let structures = [];
        let usedUmbrella = 0;
        let umbrella = 0;
        let baldaquin = 0;
        let zones = Object.keys(grid);
        for (let i = 1; i <= list.length; i++) {
            let folder = list[i];
            for (let z = 0; z < zones.length; z++) {
                let zone = zones[z],
                    seats = grid[zone];
                for (let s = 0; s < seats.length; s++) {
                    let seat = seats[s];
                    if (seat.type == 'umbrella' && seat.image[0] == folder) {
                        usedUmbrella = i;
                        umbrella++;
                    } else if (seat.type == 'baldaquin') {
                        baldaquin++;
                    }
                    if (seat.type == 'umbrella' || seat.type == 'baldaquin') {
                        let structure = seat.info.mapElement.structure.id;
                        if (structures.indexOf(structure) == -1) {
                            structures.push(structure);
                        }
                    }
                }
            }
        }
        return { usedUmbrella, umbrella, baldaquin, structures };
    }
    refreshCombinations() {
        const savedCombinations = [];
        let eleSubFolders = ["a", "b", "c"];
        const structures = [],
            elements = [].concat(this.editList);
        let used = this.checkGridForElements().usedUmbrella;
        while (elements.length < used) {
            this.editList.push(Object.assign({}, this.editList[this.editList.length - 1]));
            elements.push(Object.assign({}, elements[elements.length - 1]));
        }
        for (let i = 0; i < elements.length; i++) {
            elements[i]['folder'] = eleSubFolders[i];
        }

        this.structures.map((structure) => {
            if (structure.active && structure.type == 'umbrella') {
                structures.push(structure);
            }
        });
        const sLen = structures.length,
            eLen = elements.length;
        const generateBaldaquins = function () {
            const baldaquins = [];
            this.dataChanged = true;

            this.baldaquins.map((baldaquin: any) => {
                if (baldaquin.active) {
                    baldaquins.push(baldaquin);
                }
            });
            this.selectedBaldaquins = baldaquins;
            const structuresB = [];
            this.structures.map((structure) => {
                if (structure.active && structure.type == 'baldaquin') {
                    structuresB.push(structure);
                }
            });
            for (let i = 0; i < baldaquins.length; i++) {
                let element = {
                    baldaquin: baldaquins[i]
                };
                for (let j = 0; j < structuresB.length; j++) {
                    let structure = structuresB[j];
                    const rec = this.assetService.getMergedImageConfig(structure, element);
                    rec.structure = structure;
                    rec.b64 = element.baldaquin.img;
                    rec.element = element;
                    savedCombinations.push(rec);
                }
            }
            this.savedCombinations = savedCombinations;
            this.saveBeachCombinations();


        }.bind(this);
        const generateUmbrella = function (sInd, eInd) {
            let structure = structures[sInd],
                element = elements[eInd];
            const rec = this.assetService.getMergedImageConfig(structure, element);
            mergeImages(rec.list.all, {
                width: rec.size.imgWidth,
                height: rec.size.height
            })
                .then(b64 => {
                    rec.b64 = b64;
                    rec.structure = structure;
                    rec.element = element;
                    savedCombinations.push(rec);
                    sInd++;
                    if (sInd >= sLen) {
                        sInd = 0;
                        eInd++;
                    }
                    if (eInd >= eLen) {
                        generateBaldaquins();
                        return;
                    } else {
                        generateUmbrella(sInd, eInd);
                    }
                });
        }.bind(this);
        if (sLen && eLen) {
            generateUmbrella(0, 0);
        } else {
            generateBaldaquins();
        }



        /* const doMerge = function () {
            const rec = this.assetService.getMergedImageConfig(this.structures[0], this.editList[0]);
            mergeImages(rec.list.all, rec.size)
                .then(b64 => {
                    this.savedCombinations.push(b64);
                });    
        };
        doMerge();
        return;*/

    }
    getMergedImage(list) {
        return mergeImages(list);
    }
    dropSunbed(ev, index = -1) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text"),
            row: any = this.editList[index],
            type = 'sunbed',
            len = type.length + 1,
            id = data.substr(len, data.length - len),
            uList = this.sunbeds,
            umbrella = this.matchById(id, uList);
        if (umbrella) {
            this.currentlyEditing.sunbed = umbrella;
            row.sunbed = umbrella;
            if (row.umbrella && row.sunbed) {
                this.umbrellaChanged = true;
            }

        } else {

        }
        this.refreshBackUp('umbrella');
        this.isValidUmbrella();
        // this.r//efreshCombinations();
    }


    dropUmbrella(ev, index = -1) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text"),
            row: any = this.editList[index],
            type = 'umbrella',
            len = type.length + 1,
            id = data.substr(len, data.length - len),
            uList = this.umbrellas,
            umbrella = this.matchById(id, uList);
        if (umbrella) {
            this.currentlyEditing.umbrella = umbrella;
            row.umbrella = umbrella;
            if (row.umbrella && row.sunbed) {
                this.umbrellaChanged = true;
            }
            // this.doDrop(ev, data);
        } else {

        }
        this.refreshBackUp('umbrella');
        this.isValidUmbrella();
        // this.r//efreshCombinations();
    }

    drop(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        var element = $('#' + data);
        var to = $(ev.target);
        var to_class = $(ev.target).attr('class');

        if (element.hasClass(to_class)) {

            if (to.is('img')) {
                to = to.parent();
            }

            to.html(element.clone());

            if (to.parent().find('.umbrella').children().length > 0 && to.parent().find('.sunbed').children().length > 0) {
                this.combinations.push({
                    umbrella: to.parent().find('.umbrella img').attr('id'), sunbed: to.parent().find('.sunbed img').attr('id')
                });

            }
        }
    }

    selectElement(element: any, eleType = 'all') {
        this.dataChanged = true;
        element.active = !element.active;
        if (eleType == 'baldaquin') {
            this.baldaquinChanged = true;
            this.refreshBackUp('baldaquin');
        } else if (eleType == 'structure') {
            this.structureChanged = true;
            this.isStructureSelected();
        }
        // this.r//efreshCombinations();
    }
    isStructureSelected(saved = false) {
        let umbrella = false, baldaquin = false;
        let list = this.structuresUmbrella; // .concat(this.structuresBaldaquin);
        for (let i = 0; i < list.length; i++) {
            const li = list[i];
            if (li.active) {
                umbrella = true;
                break;
            }
        }
        list = this.structuresBaldaquin;
        for (let i = 0; i < list.length; i++) {
            const li = list[i];
            if (li.active) {
                baldaquin = true;
                break;
            }
        }
        this.structureUmbrellaSelected = umbrella;
        this.structureBaldaquinSelected = baldaquin;
        this.structureSelected = (umbrella || baldaquin) ? true : false;
        if (!this.structureChanged) {
            this.structureUmbrellaSaved = umbrella;
            this.structureBaldaquinSaved = baldaquin;
        }
        this.refreshBackUp('structure', saved);
        if (saved) {
            this.removeElementsWithoutStructures();
        }
    }

    removeElementsWithoutStructures() {
        let editList = [];
        this.editList.map((li: any) => {
            if (li.umbrella && li.sunbed) {
                editList.push(li);
            }
        });
        let noUmbrella = false, noBaldaquin = false;
        if (!this.structureUmbrellaSelected && editList.length) {
            noUmbrella = true;
            this.editList = [{}];
            this.saveBeachElements(false);
        }
        let baldaquins = [];
        this.baldaquins.map((baldaquin: any) => {
            if (baldaquin.active) {
                baldaquins.push(baldaquin);
            }
        });
        // Baldaquin not selected
        if (!this.structureBaldaquinSelected && baldaquins.length) {
            noBaldaquin = true;
            this.baldaquins.map((baldaquin: any) => {
                baldaquin.active = false;
            });
            this.saveBeachBaldaquins(false);
        }
        if (!noBaldaquin && !noUmbrella) {
            this.saveBeachCombinations();
        } else {
            this.thingsLoaded = true;
        }
    }
    saveStructure() {

        var structures = [];
        this.structures.map(item => {
            if (item.active) {
                structures.push(item.id);
            }
        });

        this.beachService.saveStructure(this.combinations, structures)
            .then(response => {

            })
            .catch(error => {

            });
    }
}
