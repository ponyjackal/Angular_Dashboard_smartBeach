import { Component, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/observable/of';
import { BeachService, AppService, AssetService } from '../../services';
import swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { environment } from 'environments/environment';
declare const Konva: any;
declare const $: any;
let viewComponent = null;

@Component({
	selector: 'app-view-beach-map-cmp',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss']
})

export class ViewComponent implements OnInit {

	public downFlag = false;
	private createContainer: any;
	private seatNumberArray = [];
	private changed_map = {};
	public editingNumbers = false;
	public editingSuspend = false;
	public loaded = false;
	public selected_sus = [];
	public suspened_seats = [];
	public elements: any = [];
	private beach: any;
	public staticElements = [];
	public selectedBaldaquins = [];
	public validUmbrella = false;

	editList = [{}];
	sunbeds: any = [];
	structures: any = [];
	structuresUmbrella: any = [];
	structuresBaldaquin: any = [];
	combinations: any = [];
	public elementsLoaded = {
		element: false,
		structure: false
	};
	public imgPath = null;
	umbrellas: any = [];
	baldaquins: any = [];
	public savedCombinations = [];
	public combinationLoaded = false;
	public containerStyle: any;
	public ratio = 1;
	padding = 5;
	public beach_id = "";
	unit: string = 'px';
	mStatusH: number = 3;
	seatWidth: number = 71;
	seatHeight: number = 50;
	public grid: any;
	constructor(
		private beachService: BeachService,
		private translate: TranslateService,
		private appService: AppService,
		private assetService: AssetService,
		private router: Router,
	) {
		this.translate.use(this.appService.getLang());
		viewComponent = this;
		this.loadSavedElements();
		this.appService.getBeach().then((beach) => {
			this.beach = beach;
			this.imgPath = environment.imgURL + "/uploads/" +beach.id + "/elements/";
			// this.loadElements();
			// this.loadStructures();
			// this.loadBeachCombinations();
		}).catch((error) => {
			console.error("Error getting beach info");
		});
	}

	private beach_grid: any
	onClickItem(item: any) {
		console.log("12233",item);
		if (this.editingSuspend) {
			item.disabledNow = !item.disabledNow;
		} else if (this.editingNumbers) {
			swal({
				type: 'question',
				title: 'Edit Seat Number',
				input: 'text',
				confirmButtonClass: 'btn btn-info',
				buttonsStyling: false,
				inputValue: item.number,
			})
				.then(newNumber => {
					if (viewComponent.addChangedNumber(item.index, newNumber)) {
						item.newNumber = newNumber;
					} else {
						throw { message: 'exists' }
					}
				})
				.catch(() => {
					swal.noop();

				});
		}
	}
	getSuspendedSeats() {
		let grid = this.grid;
		this.beachService.getSuspendedSeats(moment(this.start.value).format('YYYY-MM-DD HH:mm:ss'), moment(this.end.value).format('YYYY-MM-DD HH:mm:ss'))
			.then((seats) => {
				Object.keys(grid).map((zone) => {
					let list = grid[zone];
					list.map((li) => {
						if (seats.indexOf(li.index + "") > -1) {
							li.disabled = true;
						} else {
							li.disabled = false;
						}
						li.disabledNow = li.disabled;
					});
				});

				this.selected_sus = JSON.parse(JSON.stringify(seats));
				this.suspened_seats = seats;
			})
			.catch(error => {
			});
	}

	getMax() {
		let max = { x: 1600, y: 900 };
		try {
			let setting = this.beach_grid.grid_setting;
			return { x: setting.width, y: setting.height };
		} catch (e) {
			return max;
		}
	}
	getItemStyle(item: any) {
		let coord = item.coords;
		let width = item.info.mapElement.size.width,
			height = item.info.mapElement.size.height;
		let style = {
			'left': `${coord.x * this.ratio}${this.unit}`,
			'top': `${coord.y * this.ratio}${this.unit}`,
			'width': `${width * this.ratio}${this.unit}`,
			'height': `${height * this.ratio}${this.unit}`
		}
		item.style = style;
		return style;
	}

	getPosStyle(coord: any): any {

		let style = {
			'left': `${coord.x * this.ratio}${this.unit}`,
			'top': `${coord.y * this.ratio}${this.unit}`,
			'width': `${this.seatWidth * this.ratio}${this.unit}`,
			'height': `${this.seatHeight * this.ratio}${this.unit}`
		}
		return style;
	}
	getFullWidth() {
		const max = this.getMax();
		let ratio = this.ratio;
		ratio = 1;
		let style = {
			display: 'block',
			width: `${(max.x + this.padding) * ratio}px`,
			height: `${(max.y + this.padding) * ratio}px`
		};
		this.containerStyle = style;
		return style;
	}
	getPosImg(item) {
		let img = this.imgPath;
		if (item.type == 'static') {
			img = item.image;
		} else {
			img += item.image;
		}
		item.img = img;
		return img;
	}
	getStatusClass(li) {
		let type = li.type,
			cls = type.substr(0, 1),
			getStatus = function (list) {
				let no = 1;
				for (let i = 0; i < list.length; i++) {
					if (list[i] == 'booked' || list[i] == 'pending') {
						no = 2;
						break;
					}
				}
				return '_' + no;
			};
		if (type == 'static' || !li.status) {
			return 's_0';
		}
		let keys = Object.keys(li.status);
		for (let i = 0; i < keys.length; i++) {
			let side = keys[i];
			cls += getStatus(li.status[side]);
		}
		return cls;

	}
	gridRefreshed() {
		const fullClassList = ['u_2_2', 'u_2', 'b_2'];
		Object.keys(this.grid).forEach((side: any) => {
			let list = this.grid[side];
			list.map((li: any) => {
				li.newNumber = li.number;
				li.img = this.getPosImg(li);
				li.style = this.getItemStyle(li);
				let cls = this.getStatusClass(li);
				li.status_class = cls;
				li.isFull = (fullClassList.indexOf(cls) > -1) ? true : false;
			});
		})
		this.getFullWidth();
	}

	modified() {

	}
	detectLastComponent() {

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

								li.active = true;
								break;
							}
						}
					}
				}
				this.elementsLoaded.structure = true;


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
			this.combinationLoaded = true;
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
			this.isValidUmbrella();
			this.elementsLoaded.element = true;
		}).catch((error) => {
			this.editList = [{}];
			this.isValidUmbrella();
		});
	}
	loadSavedElements() {
		this.editList = [{
		}];
		this.isValidUmbrella();
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

	ngOnInit() {
		var defaults = {
			"line": [10, 10, '#fff'], // x step, y step, color
			"gridres": [1600, 600],
			"firstElementposition": [15, 40]
		};
		var gridzoomtime = 20;
		var maxWidth = defaults.gridres[0] * (1 + 0.1 * gridzoomtime);
		var maxHeight = defaults.gridres[1] * (1 + 0.1 * gridzoomtime);
		var mappanel = document.getElementById('mappanel');
		var nearDis = 120;

		var zoomScale = 1;
		var currentScale = 1;

		var gridScale = 1;

		function getSizeByRatio(params) {
			let { width, height, seatGridWidth } = params;
			let ratio = viewComponent.gridScaleRatio * 100;
			width = width / 100 * ratio;
			height = height / 100 * ratio;
			if (seatGridWidth) {
				seatGridWidth = seatGridWidth / 100 * ratio;
			}
			return {
				width, height, seatGridWidth
			};
		}


		function initGrid(

			grid = { front: [], middle: [], back: [] },
			setting = { width: 1600, height: 900 }
		) {

			this.gridRefreshed();
		}

		


		this.beachService.checkLogic(this.beachService.CHECK.BEACH_MAP)
			.then(() => {
				return this.beachService.getBeachGrid();
			})
			.then(beach_grid => {
				this.loaded = true;
				this.beach_grid = beach_grid;
				this.grid = Object.assign({}, this.beach_grid.grid);
				this.beach_id = beach_grid.beach_id;
				this.gridRefreshed();
				//initGrid(this.beach_grid.grid, this.beach_grid.grid_setting);
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
					this.loaded = true;
				}
			})
	}
	addChangedNumber(oldValue, newValue): boolean {
		if (this.seatNumberArray[newValue]) return false;
		this.changed_map[oldValue] = newValue;
		this.seatNumberArray[oldValue] = false;
		this.seatNumberArray[newValue] = true;
		for (var key of Object.keys(this.changed_map)) {
			if (this.changed_map[key] === oldValue) {
				delete this.changed_map[oldValue];
				this.changed_map[key] = newValue;
				if (key === newValue) delete this.changed_map[key];
				break;
			}
		}
		return true;
	}
	saveChangedNumber() {
		this.beachService.changeSeatLabel(this.changed_map)
			.then(() => {
				this.editingNumbers = false;
			})
			.catch(error => {
			})
	}
	onClickEditSeat() {
		if (this.editingSuspend) return;
		this.editingNumbers = true;
	}
	onClickEditSuspend() {
		if (this.editingNumbers) return;
		this.editingSuspend = true;
	}
	onClickCancelNumber = () => {
		let changed = {};
		let grid = this.grid;
		Object.keys(grid).map((zone) => {
			let list = grid[zone];
			list.map((li) => {
				li.newNumber = li.number;
			});
		});
		this.editingNumbers = false;
	}
	onClickCancelSunbed = () => {
		let grid = this.grid;
		Object.keys(grid).map((zone) => {
			let list = grid[zone];
			list.map((li) => {
				li.disabledNow = li.disabled;
			});
		});
		this.editingSuspend = false;
	}
	today = new Date()
	start = new FormControl(new Date())
	end = new FormControl(new Date())
	saveSuspends() {

		let selected_sus = [],
			grid = this.grid;
		Object.keys(grid).map((key) => {
			let list = grid[key];
			list.map((li) => {
				if (li.disabledNow) {
					selected_sus.push(li.index + '');
				}
			});
		});

		this.beachService.suspendSeats(selected_sus, moment(this.start.value).format('YYYY-MM-DD HH:mm:ss'), moment(this.end.value).format('YYYY-MM-DD HH:mm:ss'))
			.then(() => {
				Object.keys(grid).map((key) => {
					let list = grid[key];
					list.map((li) => {
						li.disabled = li.disabledNow;
					});
				});
				this.suspened_seats = JSON.parse(JSON.stringify(selected_sus));
				this.editingSuspend = false;
			})
			.catch(error => {

			});
	}


	selectElement(element: any) {
		element.active = !element.active;
	}
}
